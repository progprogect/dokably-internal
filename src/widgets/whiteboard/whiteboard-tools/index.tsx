import InstrumentsPanel from '../instruments-panel';
import styles from './style.module.scss';
import { Unit } from '@entities/models/unit';
import {
  TLEventMapHandler,
  TLFrameShape,
  TLShape,
  TLShapeId,
  createShapeId,
  track,
  useEditor,
  useValue,
} from '@tldraw/editor';
import BottomPanel from '../bottom-panel';
import { useEffect } from 'react';
import useCoEditing from '@app/hooks/whiteboard/useCoEditing';
import Toolbar from '../toolbar';
import { v4 as uuidv4 } from 'uuid';
import UnitTitle from '@widgets/components/Actions/UnitTitle';
import UnitActions from '@widgets/unit-actions';
import { useInsertTextLink } from '../text-link/useInsertTextLink';
import {
  CUSTOM_TEXT_SHAPE_ID,
  MIND_MAP_CHILD_INPUT_SHAPE_ID,
  MIND_MAP_SOFT_ARROW_SHAPE_ID,
  MIND_MAP_SQUARE_ARROW_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import { ShapeTypesToFocus, useShapeFocus } from './useShapeFocus';
import MindMapAddChildInputBtns from '../mindmap/add-child-input-btns/MindMapAddChildBtns';
import HoverMindMapAddChildBtns from '../mindmap/add-child-input-btns/HoverMindMapAddChildBtns';
import { IMindMapSoftArrow } from '../mindmap/mind-map-soft-arrow/types';
import { IMindMapSquareArrow } from '../mindmap/mind-map-square-arrow/types';
import { useLinkContentPanel } from '../text-link/useShowTextLinkPanel';

type MindMapLineType = IMindMapSoftArrow | IMindMapSquareArrow;

function canEnclose(shape: TLShape, ancestorIds: TLShapeId[], frame: TLShape): boolean {
	// We don't want to pull in shapes that are ancestors of the frame (can create a cycle)
	if (ancestorIds.includes(shape.id)) {
		return false
	}
	// We only want to pull in shapes that are siblings of the frame
	if (shape.parentId === frame.parentId) {
		return true
	}
	return false
}

const CustomUi = track(({ unit }: { unit: Unit }) => {
  const editor = useEditor();
  useCoEditing({ editor, unit });

  const isFocusMode = useValue(
    'focus',
    () => editor.getInstanceState().isFocusMode,
    [editor]
  );

  const focusShapeUponCreationIfNeeded = useShapeFocus();

  useEffect(() => {
    if (!editor) {
      return;
    }

    const captureShapesIntoFrame = (frame: TLFrameShape) => {
      const bounds = editor.getShapePageBounds(frame)!

      const allShapes = editor.getPageShapeIds(editor.getCurrentPage());
      const shapesExceptForCurrentFrame = Array.from(allShapes).filter((id) => id !== frame.id);

      const children = editor.getSortedChildIdsForParent(frame.id)
      const shapesToReparent: TLShapeId[] = []

      for (const shape of shapesExceptForCurrentFrame) {
        const shapeBounds = editor.getShapePageBounds(shape)!

        if (bounds.includes(shapeBounds) && !children.includes(shape)) {
          shapesToReparent.push(shape)
        }
      }

      if (shapesToReparent.length > 0) {
        editor.reparentShapes(shapesToReparent, frame.id)
      }
    }

    const excludeShapesFromFrame = (frame: TLFrameShape) => {
      const bounds = editor.getShapePageBounds(frame)!
      const children = editor.getSortedChildIdsForParent(frame.id)

      const shapesToReparent: TLShapeId[] = []

      for (const childId of children) {
        const childBounds = editor.getShapePageBounds(childId)!

        if (!bounds.includes(childBounds)) {
          shapesToReparent.push(childId)
        }
      }

      if (shapesToReparent.length > 0) {
        editor.reparentShapes(shapesToReparent, editor.getCurrentPageId())
      }
    }

    const overrideFrameOnResizeEndCb = () => {
      const frameUtil = editor.shapeUtils.frame;

      if (frameUtil) {
        const frameOnResizeEndCb = frameUtil.onResizeEnd;

        frameUtil.onResizeEnd = (...args) => {
          if (frameOnResizeEndCb) {
            frameOnResizeEndCb(...args);
          }

          captureShapesIntoFrame(args[0] as TLFrameShape);
          excludeShapesFromFrame(args[0] as TLFrameShape);
        };
      }
    }

    overrideFrameOnResizeEndCb();
  }, [editor])

  const deleteLineToMindMapDeletedInput = (shapeId: TLShapeId, parentId: TLShapeId) => {
    const getShapeWithDescedants = (currentShapeId: TLShapeId): TLShape[] => {
      const descedantIdsSet =
        editor.getShapeAndDescendantIds([currentShapeId]) || new Set();

      const descedantIds = Array.from(descedantIdsSet);

      const descedantShapes = descedantIds.reduce((acc: TLShape[], currVal) => {
        const shape = editor.getShape(currVal);

        if (!shape) return acc;

        return [...acc, shape];
      }, []);

      return descedantShapes;
    };

    const getLinesFromShapes = (shapes: TLShape[]): MindMapLineType[] => {
      const lineTypes = [
        MIND_MAP_SQUARE_ARROW_SHAPE_ID,
        MIND_MAP_SOFT_ARROW_SHAPE_ID,
      ] as string[];

      const lines = shapes.filter((item) => lineTypes.includes(item.type));

      return lines as MindMapLineType[];
    };


    const getLineFromParent = (shapeId: TLShapeId, parentId: TLShapeId) => {
      const mainInputDescedants = getShapeWithDescedants(parentId);
      const descedantLines = getLinesFromShapes(mainInputDescedants);

      const lineToShape = descedantLines.find((item) => {
        if (item.props.end.type === 'point') return false;
        if (item.props.end.boundShapeId === shapeId) return true;
        return false;
      });

      return lineToShape;
    };

    const deleteLineToShape = (shapeId: TLShapeId, parentId: TLShapeId) => {
      const lineToShape = getLineFromParent(shapeId, parentId);

      if (!lineToShape) return;

      editor.deleteShape(lineToShape.id);
    }

    deleteLineToShape(shapeId, parentId)
  }

  const captureShapesIntoFrameWhenCreatedByClick = (record: TLFrameShape) => {
    if (record.props.w !== 320 && record.props.h !== 180) return;

    const bounds = editor.getShapePageBounds(record)!;
    const shapesToAddToFrame: TLShapeId[] = [];

    const ancestorIds = editor
      .getShapeAncestors(record)
      .map((shape) => shape.id);

    editor.getSortedChildIdsForParent(record.parentId).map((siblingShapeId) => {
      const siblingShape = editor.getShape(siblingShapeId);

      if (!siblingShape) return;
      if (siblingShape.id === record.id) return;
      if (siblingShape.isLocked) return;

      const pageShapeBounds = editor.getShapePageBounds(siblingShape);
      if (!pageShapeBounds) return;

      if (bounds.contains(pageShapeBounds)) {
        if (canEnclose(siblingShape, ancestorIds, record)) {
          shapesToAddToFrame.push(siblingShape.id);
        }
      }
    });

    editor.reparentShapes(shapesToAddToFrame, record.id);
  };

  useEffect(() => {
    const handleChangeEvent: TLEventMapHandler<'change'> = (change) => {
      if (change.source === 'user') {
        // Added
        for (const record of Object.values(change.changes.added)) {
          if (record.typeName === 'shape') {
            if (record.type === 'frame') {
              if (editor) {
                editor.sendToBack([record.id]);
                captureShapesIntoFrameWhenCreatedByClick(record as unknown as TLFrameShape)
              }
            }
            if (record.type === 'text') {
              const id = createShapeId(uuidv4());
              const data = { ...record };
              editor.deleteShapes([record.id]);
              editor.createShapes([
                {
                  id,
                  type: CUSTOM_TEXT_SHAPE_ID,
                  x: data.x,
                  y: data.y,
                  props: {},
                },
              ]);
              editor.select(id);
            }
            focusShapeUponCreationIfNeeded(record as ShapeTypesToFocus);
          }
        }

        for (const record of Object.values(change.changes.removed)) {
          if (record.typeName === 'shape') {
            if (record.type === MIND_MAP_CHILD_INPUT_SHAPE_ID) {
              deleteLineToMindMapDeletedInput(record.id, record.parentId as TLShapeId)
            }
          }
        }
      }
    };

    editor.on('change', handleChangeEvent);

    return () => {
      editor.off('change', handleChangeEvent);
    };
  }, [editor]);

  const {
    insertLinkPanelJsx,
    openInsertLinkPanel,
  } = useInsertTextLink()

  const linkContentPanel = useLinkContentPanel()

  return (
    <div className={styles.whiteboardToolsLayout}>
      {!isFocusMode && <UnitTitle unit={unit} />}
      {!isFocusMode && <UnitActions unit={unit} />}
      {!isFocusMode && <InstrumentsPanel unit={unit} />}
      {!isFocusMode && <BottomPanel />}
      {!isFocusMode && <Toolbar openLinkPanel={openInsertLinkPanel} />}
      {!isFocusMode && <MindMapAddChildInputBtns />}
      {!isFocusMode && <HoverMindMapAddChildBtns />}
      {!isFocusMode && insertLinkPanelJsx}
      {!isFocusMode && linkContentPanel}
    </div>
  );
});

export default CustomUi;
