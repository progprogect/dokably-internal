import { EditorState, KeyBindingUtil, RichUtils, ContentBlock } from 'draft-js';
import { toolbarStyleMap } from '@app/constants/Editor.styles';
import BlockType from '@entities/enums/BlockType';
import useContentBlock from '@app/hooks/editor/useContentBlock';
import { useEditorEvents } from '@app/hooks/editor/useEditorEvents';
import useInlineStyles from '@app/hooks/editor/useInlineStyles';
import { createImagePlugin } from '@widgets/editor/plugins/Image';
import { createLinkPlugin } from '@widgets/editor/plugins/Link';
import { createClipboardPasteHandler } from '@widgets/editor/plugins/Image/clipboardHandler';
import ScrollerPlugin from '@widgets/editor/plugins/Scroller/ScrollerPlugin';
import ToolbarPlugin from '@widgets/editor/plugins/Toolbar/ToolbarPugin';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useEditorPlugins from './DokablyEditor.plugins';
import Editor, { PluginFunctions } from '@draft-js-plugins/editor';
import * as _ from 'lodash';
import { useEditorSelection } from '@app/hooks/editor/useEditorSelection';
import { useDispatch, useSelector } from 'react-redux';
import { renameUnit, selectUnits } from '@app/redux/features/unitsSlice';
import { updateDeleteBoardModalState } from '@app/redux/features/modalsSlice';
import { Unit } from '@entities/models/unit';
import { EMBEDS_BLOCK_TYPES } from '@app/constants/embeds';
import useCoEditing from './useCoEditing';
import { IDokablyEditor } from './DokablyEditor.types';
import { withCommentTextHighlighting } from '@widgets/editor/plugins/decorators/withCommentTextHighlighting';
import { useDokablyEditor } from './DokablyEditor.context';
import { withMention } from '@widgets/editor/plugins/decorators/withMention';
import { useWorkspaceContext } from '@app/context/workspace/context';
import { CompositeDecorator, DraftDecorator, Modifier } from 'draft-js';
import { autoPlacement, useFloating } from '@floating-ui/react-dom';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { LinkEditPanel } from '@widgets/editor/plugins/Link';
import ReactDOM from 'react-dom';
import { useDebounce } from 'usehooks-ts';
import { EDITOR_COMMANDS } from './constants';
import { useClipboardImagePaste } from '@app/hooks/editor/useClipboardImagePaste';

let editor: Editor | null = null;

export const clearFocus = () => {
  _.delay(() => {
    editor?.blur();
  }, 1);
};

const DokablyEditor = ({ editorState, setEditorState, isInit, onFocus, onBlur, mode = 'default' }: IDokablyEditor) => {
  const dispatch = useDispatch();
  const units = useSelector(selectUnits).units;
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const { unit, readonly, setReadOnly } = useDokablyEditor();
  const { activeWorkspace } = useWorkspaceContext();
  const { getCurrentContentBlock } = useContentBlock();
  const { toggleInlineStyle, removeStylesInNewLine } = useInlineStyles();

  const editorRef = useRef<Editor | null>(null);
  const pluginsRef = useRef<any[]>([]);
  const pluginsInitializedRef = useRef<boolean>(false);

  const {
    ref: linkEditRef,
    isVisible: isLinkEditVisible,
    setIsVisible: setLinkEditVisible,
  } = useClickOutside<boolean>(false);

  const { x, y, reference, floating, refs } = useFloating<HTMLAnchorElement>({
    placement: 'bottom',
    middleware: [
      autoPlacement({
        alignment: 'start',
        padding: 10,
        allowedPlacements: ['bottom-start', 'bottom-end'],
      }),
    ],
  });

  const handleBackdropClick = useCallback(() => {
    setLinkEditVisible(false);
  }, [setLinkEditVisible]);

  useCoEditing({
    documentId: unit.id,
    editorState,
    setEditorState,
    unit,
    isInit,
    mode,
  });

  const documentTitle = editorState.getCurrentContent().getBlockMap().first().getText();
  const debouncedDocumentTitle = useDebounce(documentTitle, 1000);

  useEffect(() => {
    const currentContent = editorState.getCurrentContent();
    const blockMap = currentContent.getBlockMap();
    const titleBlock = blockMap.find((block) => block?.getText().trim() !== '');

    if (titleBlock && unit.id) {
      const currentUnit = {
        ...units.find((u: Unit) => u.id === unit.id),
      } as Unit;
      if (currentUnit && currentUnit.name !== titleBlock.getText()) {
        const title = titleBlock.getText();
        // currentUnit.name = title.length > 0 ? title : 'Untitled';
        currentUnit.name = title;
        if (isInit && unit.name !== title) dispatch(renameUnit(currentUnit));
      }
    }
  }, [debouncedDocumentTitle]);

  const onLinkClick = (node: HTMLAnchorElement | null) => {
    if (!node) {
      setLinkEditVisible(false);
      return;
    }

    reference(node);

    setTimeout(() => {
      setLinkEditVisible(true);
    }, 10);
  };

  const { LinkButton, linkPlugin } = useMemo(() => {
    const { LinkButton, ...linkPlugin } = createLinkPlugin(onLinkClick);
    return {
      LinkButton: (props: any) => (
        <LinkButton
          {...props}
          decorator={linkPlugin.decorators as DraftDecorator[]}
        />
      ),
      linkPlugin,
      linkDecorators: linkPlugin.decorators as DraftDecorator[],
    };
  }, []);

  const editorFunctionsRef = useRef({
    getEditorState: () => editorState,
    setEditorState: setEditorState,
  });

  useEffect(() => {
    editorFunctionsRef.current = {
      getEditorState: () => editorState,
      setEditorState: setEditorState,
    };
  }, [editorState, setEditorState]);

  const { ImageScrollerButton, imagePlugin, extendedBlockRenderMap } = useMemo(() => {
    const { ImageScrollerButton, blockRendererFn, extendedBlockRenderMap, initialize } = createImagePlugin();

    initialize!({
      getEditorState: () => editorFunctionsRef.current.getEditorState(),
      setEditorState: (state) => {
        const setEditorStateFn = editorFunctionsRef.current.setEditorState;
        if (typeof state === 'function') {
          setEditorStateFn((currentState) => {
            return (state as (currentState: EditorState) => EditorState)(currentState);
          });
        } else {
          setEditorStateFn(state);
        }
      },
    } as PluginFunctions);

    return {
      ImageScrollerButton,
      imagePlugin: {
        blockRendererFn,
      },
      extendedBlockRenderMap,
    };
  }, []);

  // This useEffect will be moved after getPlugins declaration



  const compositeDecorator = useMemo(() => {
    const linkDecorators = linkPlugin.decorators || [];
    return new CompositeDecorator([withMention, withCommentTextHighlighting, ...(linkDecorators as DraftDecorator[])]);
  }, [linkPlugin.decorators]);

  const {
    tabCommand,
    resetTypeCommand,
    decreaseBlockDepthCommand,
    keyCommandPlainBackspace,
    keyCommandPlainDelete,
    keyCommandInsertNewline,
  } = useEditorEvents({
    editorState,
    setEditorState,
  });

  const { handleClickInEditor, handleKeyDownInEditor } = useEditorSelection();
  
  const { handlePastedFiles, handlePastedText, handleCustomPaste } = useClipboardImagePaste(setEditorState);

  // Callback function for showing board delete confirmation
  const handleShowDeleteBoardConfirmation = useCallback(
    (editorState: EditorState, contentBlock: ContentBlock, pluginFunctions: PluginFunctions) => {
      dispatch(
        updateDeleteBoardModalState({
          isOpen: true,
          editorState,
          contentBlock,
          pluginFunctions,
        }),
      );
    },
    [dispatch],
  );

  const { getPlugins } = useEditorPlugins(mode === 'default' ? 'document' : 'task', {
    showDeleteBoardConfirmation: handleShowDeleteBoardConfirmation,
  });

  useEffect(() => {
    if (!pluginsInitializedRef.current && editor) {
      editorRef.current = editor;

      const basePlugins = getPlugins(editor);

      pluginsRef.current = [...basePlugins, linkPlugin, imagePlugin];

      pluginsInitializedRef.current = true;
    }
  }, [editor, getPlugins, linkPlugin, imagePlugin]);

  // Убираем глобальный paste обработчик для предотвращения дублирования
  // Вся логика обработки изображений сосредоточена в handlePastedText
  // Это обеспечивает чистую архитектуру без конфликтов
  useEffect(() => {
    // Можно добавить handleCustomPaste для дебаггинга при необходимости
    // const handlePaste = (event: ClipboardEvent) => handleCustomPaste(event);
    // document.addEventListener('paste', handlePaste);
    // return () => document.removeEventListener('paste', handlePaste);
  }, [handleCustomPaste]);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      const { target, currentTarget } = event;
      if (target instanceof HTMLElement && currentTarget.contains(target)) {
        const tableElement = target.closest('[data-block-type="table"]');
        if (tableElement) {
          setReadOnly(false);
          event.stopPropagation();
          event.preventDefault();
          return;
        }

        setReadOnly(false);
        setEditorState((editorState) => {
          return handleClickInEditor(editorState, event);
        });
      }
    },
    [handleClickInEditor, setEditorState, setReadOnly],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      setTimeout(() => {
        setEditorState((editorState) => {
          return handleKeyDownInEditor(event, editorState);
        });
      }, 1);
    },
    [handleKeyDownInEditor, setEditorState],
  );

  const onChange = useCallback(
    (state: EditorState) => {
      setEditorState(EditorState.set(state, { decorator: compositeDecorator }));
    },
    [setEditorState, compositeDecorator],
  );



  const handleReturn = (event: any): 'handled' | 'not-handled' => {
    const currentBlock = getCurrentContentBlock(editorState);

    if (
      KeyBindingUtil.isSoftNewlineEvent(event) &&
      !EMBEDS_BLOCK_TYPES.includes(currentBlock.getType() as BlockType)
    ) {
      setEditorState(RichUtils.insertSoftNewline(editorState));
      return 'handled';
    }
  
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      const isTitle = currentBlock.getType() === 'title';
  

      let contentState = Modifier.splitBlock(editorState.getCurrentContent(), selection);
      let newEditorState = EditorState.push(editorState, contentState, 'split-block');
  
      if (isTitle) {
        const newSelection = newEditorState.getSelection();
        contentState = Modifier.setBlockType(
          newEditorState.getCurrentContent(),
          newSelection,
          'unstyled'
        );
        newEditorState = EditorState.push(newEditorState, contentState, 'change-block-type');
      }
  

      const newBlockKey = newEditorState.getSelection().getStartKey();
      const newBlock = newEditorState.getCurrentContent().getBlockForKey(newBlockKey);

      if (newBlock && newBlock.getText().length === 0) {
        newEditorState = removeStylesInNewLine(newEditorState);
      }

      setEditorState(newEditorState);
      return 'handled';
    }

    return 'not-handled';
  };
  



  const handleKeyCommand = (command: string) => {
    
    const INLINE_COMMANDS = {
      [EDITOR_COMMANDS.BOLD]: 'bold',
      [EDITOR_COMMANDS.ITALIC]: 'italic',
      [EDITOR_COMMANDS.UNDERLINE]: 'underline',
      [EDITOR_COMMANDS.STRIKETHROUGH]: 'strikethrough',
      [EDITOR_COMMANDS.CODE]: 'code',
    } as const;

    const BLOCK_COMMANDS: Record<string, () => void> = {
      [EDITOR_COMMANDS.TAB_COMMAND]: tabCommand,
      [EDITOR_COMMANDS.RESET_TYPE_COMMAND]: resetTypeCommand,
      [EDITOR_COMMANDS.DECREASE_DEPTH_COMMAND]: decreaseBlockDepthCommand,
      [EDITOR_COMMANDS.SCROLLER_SHOW]: () => {},
    };
    
    if (command in INLINE_COMMANDS) {
      setEditorState((state) => toggleInlineStyle(state, INLINE_COMMANDS[command as keyof typeof INLINE_COMMANDS]));
      return 'handled';
    }
    
    if (command in BLOCK_COMMANDS) {
      BLOCK_COMMANDS[command]();
      return 'handled';
    }
    
    // Check for TaskBoard deletion before standard backspace/delete handling
    if (command === EDITOR_COMMANDS.BACKSPACE || command === EDITOR_COMMANDS.DELETE) {
      
      try {
        // Check if we're trying to delete a TaskBoard and need confirmation
        const currentEditorState = editorState;
        const selectionState = currentEditorState.getSelection();
        const anchorKey = selectionState.getAnchorKey();
        const currentContent = currentEditorState.getCurrentContent();
        const contentBlock = currentContent.getBlockForKey(anchorKey);



        let targetBlock = null;
        let isTaskBoardDeletion = false;

        if (command === EDITOR_COMMANDS.BACKSPACE && contentBlock.getType() === 'atomic') {
          // Direct backspace on atomic block
          targetBlock = contentBlock;
          isTaskBoardDeletion = true;
        } else if (command === EDITOR_COMMANDS.DELETE) {
          // Delete key - check if next block is TaskBoard
          const anchorOffset = selectionState.getAnchorOffset();
          const blockText = contentBlock.getText();

          
          if (anchorOffset === blockText.length) {
            const blockMap = currentContent.getBlockMap();
            const currentBlockIndex = blockMap.keySeq().findIndex(key => key === anchorKey);
            const nextBlockKey = blockMap.keySeq().get(currentBlockIndex + 1);

            
            if (nextBlockKey) {
              const nextBlock = currentContent.getBlockForKey(nextBlockKey);
              
              if (nextBlock && nextBlock.getType() === 'atomic') {
                targetBlock = nextBlock;
                isTaskBoardDeletion = true;
              }
            }
          }
        }



        // Check if target block is a TaskBoard
        if (isTaskBoardDeletion && targetBlock) {
          
          const entityKey = targetBlock.getEntityAt(0);
          
          if (entityKey) {
            const entity = currentContent.getEntity(entityKey);
            const entityType = entity.getType();
            
            if (entity && entityType === 'TASK_BOARD_ENTITY') {
              // This is a TaskBoard deletion - show confirmation modal
              dispatch(
                updateDeleteBoardModalState({
                  isOpen: true,
                  editorState: currentEditorState,
                  contentBlock: targetBlock,
                  pluginFunctions: {
                    getEditorState: () => editorState,
                    setEditorState: setEditorState,
                  } as any,
                }),
              );
              return 'handled';
            }
          }
        }
      } catch (error) {
        console.error('Error in TaskBoard deletion check:', error);
      }
    }

    if (command === EDITOR_COMMANDS.BACKSPACE) {
      setEditorState((state) => keyCommandPlainBackspace(state));
      return 'handled';
    }

    if (command === EDITOR_COMMANDS.DELETE) {
      setEditorState((state) => keyCommandPlainDelete(state));
      return 'handled';
    }

    if (command === EDITOR_COMMANDS.SPLIT_BLOCK) {
      setEditorState((state) => keyCommandInsertNewline(state));
      return 'handled';
    }

    return 'not-handled';
  };

  return (
    <>
      <div
        id='editor-container'
        ref={editorContainerRef}
        className='max-w-full min-w-0 w-main relative pb-[50px]'
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const isTableClick = target.closest('[data-block-type="table"]');
          if (!isTableClick) {
            handleClick(e);
          }
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onBlur={(e) => {
          // Only set readonly if blur is not caused by toolbar interaction
          const relatedTarget = e.relatedTarget as HTMLElement;
          const isToolbarInteraction = relatedTarget?.closest('#toolbar-portal') || 
                                      relatedTarget?.closest('.floating-toolbar');
          
          if (!isToolbarInteraction) {
            setReadOnly(true);
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <Editor
          ref={(element) => {
            editor = element;
          }}
          readOnly={readonly}
          editorState={EditorState.set(editorState, { decorator: compositeDecorator })}
          onChange={onChange}
          handleKeyCommand={handleKeyCommand}
          customStyleMap={toolbarStyleMap}
          handleReturn={handleReturn}
          handlePastedFiles={handlePastedFiles}
          handlePastedText={handlePastedText}
          plugins={pluginsInitializedRef.current ? pluginsRef.current : []}
          blockRenderMap={extendedBlockRenderMap}
          onBlur={() => onBlur?.()}
          onFocus={() => onFocus?.()}
        />
      </div>
      <ToolbarPlugin
        editorState={editorState}
        setEditorState={setEditorState}
        LinkButton={LinkButton}
        mode={mode}
        onLinkClick={onLinkClick}
      />
      <ScrollerPlugin
        editorContainerRef={editorContainerRef}
        editorState={editorState}
        setEditorState={setEditorState}
        ImageScrollerButton={ImageScrollerButton}
        mode={mode}
        unitId={unit.id}
      />

      {isLinkEditVisible &&
        ReactDOM.createPortal(
          <>
            <div
              className='fixed inset-0'
              onClick={handleBackdropClick}
            />
            <LinkEditPanel
              x={x}
              y={y}
              refs={refs}
              floating={floating}
              editorState={editorState}
              setEditorState={setEditorState}
              onClose={() => setLinkEditVisible(false)}
              ref={linkEditRef}
            />
          </>,
          document.body,
        )}
    </>
  );
};

export default DokablyEditor;
