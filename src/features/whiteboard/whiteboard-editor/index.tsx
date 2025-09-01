import styles from './style.module.scss';
import CustomUi from '@widgets/whiteboard/whiteboard-tools';
import { DefaultGrid } from '@widgets/whiteboard/whiteboard-grid';
import { Unit } from '@entities/models/unit';
import '@tldraw/tldraw/tldraw.css';
import useUser from '@app/hooks/useUser';
import { customShapeUtils } from '@app/constants/whiteboard/whiteboard-shapes';
import { whiteboardTools } from '@app/constants/whiteboard/whiteboard-tools';
import {
  DefaultCanvas,
  Editor,
  InstancePresenceRecordType,
  TLOnMountHandler,
  TLParentId,
  TLShapeId,
  TLStore,
  TldrawEditor,
  TldrawUi,
  useEditorComponents,
  useTldrawUiComponents,
  useEditor,
} from '@tldraw/tldraw';
import {
  CUSTOM_DRAW_SHAPE_ID,
  CUSTOM_HIGHLIGHT_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import {
  TLExternalContentProps,
  registerDefaultExternalContentHandlers,
} from './defaultExternalContentHandlers';
import {
  useCallback,
  useDebugValue,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import assert from 'assert';
import { registerDefaultSideEffects } from './defaultSideEffects';
import {
  DefaultContextMenu,
  TLUiOverrides,
  TldrawHandles,
  TldrawScribble,
  TldrawSelectionBackground,
} from '@tldraw/tldraw';
import { CustomSelectionForeground } from './CustomSelectionForeground';
import { usePermissionsContext } from '@app/context/permissionsContext/permissionsContext';
import { useWorkspaceContext } from '@app/context/workspace/context';

const WhiteboardEditor = ({ unit, store }: { unit: Unit; store: TLStore }) => {
  const user = useUser();
  const { canEditUnit } = usePermissionsContext();
  const { activeWorkspace } = useWorkspaceContext();
  if (!user) return null;

  const components = {
    Grid: DefaultGrid,
    Scribble: TldrawScribble,
    CollaboratorScribble: TldrawScribble,
    SelectionForeground: CustomSelectionForeground,
    SelectionBackground: TldrawSelectionBackground,
    Handles: TldrawHandles,
    Canvas: DefaultCanvas,
    ContextMenu: (props: any) => <DefaultContextMenu {...props} />,
  };

  const onMount = (editor: Editor) => {
    const peerPresence = InstancePresenceRecordType.create({
      id: InstancePresenceRecordType.createId(editor.store.id),
      currentPageId: editor.getCurrentPageId(),
      userId: user.id,
      userName: user.name ?? user.email,
      cursor: { x: 0, y: 0, type: 'default', rotation: 0 },
    });
    editor.store.put([peerPresence]);
    editor.updateInstanceState({ isGridMode: true });
    editor.updateInstanceState({
      isDebugMode: false,
    });

    const canEdit = canEditUnit(unit.id);
    editor.updateInstanceState({ isReadonly: !canEdit })

    let shapesToLeave: TLShapeId[] = [];

    editor.sideEffects.registerBeforeDeleteHandler('shape', (shape) => {
      if (shape.type === 'frame') {
        const childrenIds = editor.getSortedChildIdsForParent(shape.id);
        shapesToLeave = childrenIds;
        editor.reparentShapes(childrenIds, 'page:page' as TLParentId);
      }
      if (shapesToLeave.includes(shape.id)) {
        shapesToLeave = shapesToLeave.filter(item => item !== shape.id);
        return false;
      }
    })
  };

  const myOverrides: TLUiOverrides = {
    tools(editor, tools) {
      tools[CUSTOM_DRAW_SHAPE_ID] = {
        id: CUSTOM_DRAW_SHAPE_ID,
        icon: 'color',
        label: 'tool.custom.draw' as any,
        kbd: 'c',
        readonlyOk: false,
        onSelect: (source) => {
          editor.selectNone();
          editor.setCurrentTool(CUSTOM_DRAW_SHAPE_ID);
        },
      };
      tools[CUSTOM_HIGHLIGHT_SHAPE_ID] = {
        id: CUSTOM_HIGHLIGHT_SHAPE_ID,
        icon: 'color',
        label: 'tool.custom.highlight' as any,
        kbd: 'c',
        readonlyOk: false,
        onSelect: (source) => {
          editor.selectNone();
          editor.setCurrentTool(CUSTOM_HIGHLIGHT_SHAPE_ID);
        },
      };
      tools.draw = {
        id: 'draw',
        icon: 'color',
        label: 'tool.draw',
        kbd: 'c',
        readonlyOk: false,
        onSelect: () => {
          editor.setCurrentTool(CUSTOM_DRAW_SHAPE_ID);
        },
      };
      tools.highlight = {
        id: 'highlight',
        icon: 'color',
        label: 'tool.highlight',
        kbd: 'c',
        readonlyOk: false,
        onSelect: () => {
          editor.setCurrentTool(CUSTOM_HIGHLIGHT_SHAPE_ID);
        },
      };
      return tools;
    },
  };

  return (
    <div id='dokably-whiteboard-editor' className={styles.dokablyCanvas}>
      <TldrawEditor
        initialState='select'
        components={components}
        shapeUtils={customShapeUtils}
        tools={whiteboardTools}
        autoFocus
        store={store}
        onMount={onMount}
      >
        <TldrawUi
          hideUi={false}
          components={components}
          overrides={myOverrides}
        >
          <InsideOfEditorContext workspaceId={activeWorkspace?.id} />
          <CustomUi unit={unit} />
        </TldrawUi>
      </TldrawEditor>
    </div>
  );
};

function InsideOfEditorContext({
	maxImageDimension = 1000,
	maxAssetSize = 10 * 1024 * 1024, // 10mb
	acceptedImageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
	acceptedVideoMimeTypes = ['video/mp4', 'video/quicktime'],
	onMount,
	workspaceId,
}: Partial<TLExternalContentProps & { onMount: TLOnMountHandler }>) {
	const editor = useEditor()

  useEffect(() => {
    const pasteContentNearCopiedContent = () => {
      editor.inputs.shiftKey = true;
      editor.setEditingShape(null);
    };
    document.addEventListener('paste', pasteContentNearCopiedContent);

    return () => {
      document.removeEventListener('paste', pasteContentNearCopiedContent);
    };
  }, [editor]);

	const onMountEvent = useEvent((editor: Editor) => {
		const unsubs: (void | (() => void) | undefined)[] = []

		unsubs.push(...registerDefaultSideEffects(editor))

		// for content handling, first we register the default handlers...
		registerDefaultExternalContentHandlers(editor, {
			maxImageDimension,
			maxAssetSize,
			acceptedImageMimeTypes,
			acceptedVideoMimeTypes,
			workspaceId,
		})

		// ...then we run the onMount prop, which may override the above
		unsubs.push(onMount?.(editor))

		return () => {
			unsubs.forEach((fn) => fn?.())
		}
	})

	useLayoutEffect(() => {
		if (editor) return onMountEvent?.(editor)
	}, [editor, onMountEvent, workspaceId])

  const { Canvas } = useEditorComponents()
  const { ContextMenu } = useTldrawUiComponents()

  if (ContextMenu) {
		return <ContextMenu />
	}

	if (Canvas) {
		return <Canvas />
	}

	return null
}

// duped from tldraw editor
function useEvent<Args extends Array<unknown>, Result>(
	handler: (...args: Args) => Result
): (...args: Args) => Result {
	const handlerRef = useRef<(...args: Args) => Result>()

	useLayoutEffect(() => {
		handlerRef.current = handler
	})

	useDebugValue(handler)

	return useCallback((...args: Args) => {
		const fn = handlerRef.current
		assert(fn, 'fn does not exist')
		return fn(...args)
	}, [])
}

export default WhiteboardEditor;
