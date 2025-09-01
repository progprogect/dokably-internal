import {
  Box,
  Geometry2d,
  IndexKey,
  Rectangle2d,
  ShapeUtil,
  TLOnDragHandler,
  TLOnEditEndHandler,
  TLOnResizeEndHandler,
  TLOnResizeHandler,
  TLShape,
  TLShapeId,
  Vec,
  createShapeId,
  resizeBox,
  toDomPrecision,
  useValue,
} from '@tldraw/editor';
import { IMindMapChildInput } from './mind-map-child-input-types';
import { useEffect, useState } from 'react';
import { mindMapChildInputProps } from './mind-map-child-input-props';
import {
  CUSTOM_RECTANGLE_SOFT_SHAPE_ID,
  MIND_MAP_CHILD_INPUT_SHAPE_ID,
  MIND_MAP_MAIN_INPUT_SHAPE_ID,
  MIND_MAP_SOFT_ARROW_SHAPE_ID,
  MIND_MAP_SQUARE_ARROW_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import {
  getQuillForShape,
} from '@app/utils/whiteboard/quill/utils';
import {
  MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
  MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
} from '@app/constants/whiteboard/constants';
import {
  DocablyMindMapBorder,
  DocablyMindMapBorderColor,
  DocablyMindMapSide,
  DokablyTextColor,
} from '@app/constants/whiteboard/whiteboard-styles';
import { useTextMesurements } from '@widgets/whiteboard/custom-shapes/useTextMesurements';
import { IMindMapMainInput } from '../main-input/mind-map-main-input-types';
import { IMindMapSoftArrow } from '../mind-map-soft-arrow/types';
import { IMindMapSquareArrow } from '../mind-map-square-arrow/types';
import { useEffectOnce } from 'usehooks-ts';
import { TextContentForCustomShape } from '@widgets/whiteboard/custom-shapes/text-content-for-custom-shape/TextContentForCustomShape';
import { showLinkPanelIfNeeded } from '@widgets/whiteboard/text-link/utils';

type MindMapLineType = IMindMapSoftArrow | IMindMapSquareArrow;
type MindMapInputType = IMindMapChildInput | IMindMapMainInput;

const HORIZONTAL_GAP_BTW_INPUTS = 50;
const VERTICAL_GAP_BTW_INPUTS = 50;
export class MindMapChildInputUtil extends ShapeUtil<IMindMapChildInput> {
  static override type = MIND_MAP_CHILD_INPUT_SHAPE_ID;
  static override props = mindMapChildInputProps;

  canEdit = () => true;
  override isAspectRatioLocked = (_shape: IMindMapChildInput) => false;

  override canResize = (_shape: IMindMapChildInput) => true;
  override canBind = (_shape: IMindMapChildInput) => true;

  getGeometry(shape: IMindMapChildInput): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }
  getDefaultProps(): IMindMapChildInput['props'] {
    return {
      w: MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
      h: MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
      heightWithChildren: MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
      widthWithChildren: MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
      color: DokablyTextColor.defaultValue,
      borderColor: DocablyMindMapBorderColor.defaultValue,
      fill: 'transparent',
      size: 's',
      fontFamily: 'Euclid Circular A',
      fontSize: 14,
      text: '',
      align: 'middle',
      verticalAlign: 'middle',
      url: '',
      side: DocablyMindMapSide.defaultValue,
      index: 0,
      maxYWithChildren: MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
      maxXWithChildren: MIND_MAP_CHILD_INPUT_DEFAULT_WIDTH,
      arrowId: MIND_MAP_SOFT_ARROW_SHAPE_ID,
      border: DocablyMindMapBorder.defaultValue,
      textContents: '',
    };
  }

  getBounds(shape: IMindMapChildInput) {
    return new Box(0, 0, shape.props.w, shape.props.h);
  }

  getCenter(shape: IMindMapChildInput) {
    return new Vec(shape.props.w / 2, shape.props.h / 2);
  }

  component(shape: IMindMapChildInput) {
    const { id } = shape;
    const bounds = this.editor.getShapeGeometry(shape).bounds;
    const [editingShapeLocal, setEditingShapeLocal] = useState<string | null>(
      null
    );

    useEffect(() => {
      const editAfterCreating = () => {
        const isSelected = this.editor.getOnlySelectedShapeId() === shape.id;
        if (isSelected) {
          setEditingShapeLocal(shape.id);
        }
      };
      editAfterCreating();
    }, []);

    const isLocked = useValue(
      'isLocked',
      () => this.editor.isShapeOrAncestorLocked(shape.id),
      [this.editor, shape.id]
    );

    const hadleClick: React.PointerEventHandler<HTMLDivElement> = (e) => {
      const isSelected = this.editor.getSelectedShapeIds().includes(shape.id);
      const editingShapeId = this.editor.getEditingShapeId();

      const isEditing =
        editingShapeId === shape.id || editingShapeLocal === shape.id;

      if (!isSelected) {
        this.editor.select(shape.id);
        this.editor.setEditingShape(null);
        setEditingShapeLocal(null);
        showLinkPanelIfNeeded(e.target as Element)

        if (isLocked) {
          e.stopPropagation();
        }
        return;
      }

      if (isSelected && !isEditing) {
        setEditingShapeLocal(shape.id);
        this.editor.setSelectedShapes([]);

        setTimeout(() => {
          const currentToolState = this.editor.getCurrentTool().getCurrent()?.id;

          const isTranslating = currentToolState === 'translating';
          const isPointing = currentToolState === 'pointing_shape';

          if (isTranslating || isPointing) {
            const clearHighlightingWhenTranslating = () => {
              const quill = getQuillForShape(shape.id);
              if (quill) {
                quill.disable();
                quill.blur();
              }
            }
            clearHighlightingWhenTranslating()

            setEditingShapeLocal(null);
            this.editor.setEditingShape(null);
            return;
          }

          this.editor.setEditingShape(shape.id);
        }, 100);

        return;
      }

      if (isSelected && isEditing) {
        setTimeout(() => {
          this.editor.getCurrentTool().transition('idle');
        }, 10);
        return;
      }
    };

    useTextMesurements({
      shape: CUSTOM_RECTANGLE_SOFT_SHAPE_ID,
      shapeHeight: bounds.h,
      shapeWidth: bounds.w,
    });

    let borderProps = {};

    if ((shape.props.border as string) === 'none') {
      borderProps = {
        border: 'none',
        boxShadow: 'none',
      };
    }

    if ((shape.props.border as string) === 'round') {
      borderProps = {
        borderRadius: 40,
        borderColor: shape.props.borderColor as string,
        borderStyle: 'solid',
        borderWidth: '1px',
        boxShadow: 'none'
      };
    }

    useEffectOnce(() => {
      this.createLineIfNeeded(shape);
    });
 

    return (
     
      <div>
        <div
          onPointerDown={hadleClick}
          style={{
            position: 'absolute',
            width: bounds.w,
            height: 'auto',
            minHeight: MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
          }}
        >
          <div
            className='tl-note__container tl-hitarea-fill'
            style={{
              ...borderProps,
              color: shape.props.color as string,
              backgroundColor: shape.props.fill as string,
              opacity: 1,
              height: 'auto',
              minHeight: MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              paddingLeft: '12px',
              paddingRight: '12px',
            }}
          >
            <TextContentForCustomShape
              placeholder='Type something'
              editingShape={editingShapeLocal}
              id={id}
              //@ts-ignore
              type={MIND_MAP_CHILD_INPUT_SHAPE_ID}
              fontFamily={shape.props.fontFamily}
              fontSize={shape.props.fontSize}
              fill={shape.props.fill}
              align={shape.props.align}
              verticalAlign={shape.props.verticalAlign}
              text={shape.props.text}
              labelColor={shape.props.color}
              h={shape.props.h}
              w={shape.props.w}
              textContents={shape.props.textContents}
              wrap
            />
          </div>
        </div>
      </div>
    );
  }

  indicator(shape: IMindMapChildInput) {
    const bounds = this.getBounds(shape);
    return (
      <rect
        width={toDomPrecision(bounds.width)}
        height={toDomPrecision(bounds.height)}
      />
    );
  }

  // Events
  override onResize: TLOnResizeHandler<IMindMapChildInput> = (shape, info) => {
    return resizeBox(shape, info);
  };

  onResizeEnd: TLOnResizeEndHandler<IMindMapChildInput> = (shape) => {
    this.editor.setEditingShape(shape.id);
    const quill = getQuillForShape(shape.id);

    if (!quill) return;

    quill.enable();
    quill.focus();

    const descedantShapes = this.getShapeWithDescedants(shape.id);
    const inputs = this.getChildInputsFromShapes(descedantShapes);
    const fixedChildren = inputs.map((child) => ({
      ...child,
      isLocked: false,
    }));

    this.editor.updateShapes(fixedChildren);
  };

  onEditEnd: TLOnEditEndHandler<IMindMapChildInput> = (shape) => {
    const {
      id,
      type,
      props: { text },
    } = shape;

    if (text.trimEnd() !== shape.props.text) {
      const quill = getQuillForShape(shape.id);

      let textContents = '';

      if (quill) {
        const contents = quill.getContents();
        const contentsJson = JSON.stringify(contents);
        textContents = contentsJson;
      }

      this.editor.updateShapes([
        {
          id,
          type,
          props: {
            text: text.trimEnd(),
            textContents,
          },
        },
      ]);
    }
  };

  getChildrenInputs = (
    shape: IMindMapChildInput | IMindMapMainInput,
    side: string
  ) => {
    const childrenIds = this.editor.getSortedChildIdsForParent(shape.id) || [];
    const childrenInputs = childrenIds
      .map((id) => this.editor.getShape(id))
      .filter(
        (shape) => shape?.type === MIND_MAP_CHILD_INPUT_SHAPE_ID
      ) as IMindMapChildInput[];

    const existingRightSideInputs = childrenInputs.filter(
      (shape: IMindMapChildInput) => shape?.props.side === side
    );
    return existingRightSideInputs;
  };

  getMaxYWithChildren = (next: IMindMapChildInput): number => {
    const children = this.getChildrenInputs(next, next.props.side as string);
    if (!children.length) return 0;

    const lastChild = children.reduce((acc, currVal) => {
      if (acc.props.index > currVal.props.index) return acc;
      return currVal;
    });

    return next.y + lastChild.y + lastChild.props.h;
  };

  changeColorOfDescedants = (newColor: string) => {
    const updatedLines = this.descedantLines.map((item) => ({
      ...item,
      props: { ...item.props, color: newColor },
    }));

    const updatedChildInputs = this.descedantInputs.map((item) => ({
      ...item,
      props: { ...item.props, borderColor: newColor },
    }));

    this.editor.updateShapes([...updatedLines, ...updatedChildInputs]);
  };

  getLineFromParent = (shapeId: TLShapeId, parentId: TLShapeId) => {
    const parentInputDescedants = this.getShapeWithDescedants(parentId);
    const descedantLines = this.getLinesFromShapes(parentInputDescedants);

    const lineToShape = descedantLines.find((item) => {
      if (item.props.end.type === 'point') return false;
      if (item.props.end.boundShapeId === shapeId) return true;
      return false;
    });

    return lineToShape;
  };

  changeColorOfLineFromParent = (
    color: string,
    shapeId: TLShapeId,
    parentId: TLShapeId
  ) => {
    const lineToShape = this.getLineFromParent(shapeId, parentId);
    if (!lineToShape) return;

    this.editor.updateShape({
      ...lineToShape,
      props: {
        ...lineToShape.props,
        color,
      },
    });
  };

  onBorderColorChange = (
    color: string,
    shapeId: TLShapeId,
    parentId: TLShapeId
  ) => {
    this.changeColorOfDescedants(color);
    this.changeColorOfLineFromParent(color, shapeId, parentId);
  };

  children: TLShape[] = [];
  descedants: TLShape[] = [];
  shapeWithDescedants: TLShape[] = [];
  descedantLines: MindMapLineType[] = [];
  descedantInputs: IMindMapChildInput[] = [];

  getShapeWithDescedants = (currentShapeId: TLShapeId): TLShape[] => {
    const descedantIdsSet =
      this.editor.getShapeAndDescendantIds([currentShapeId]) || new Set();

    const descedantIds = Array.from(descedantIdsSet);

    const descedantShapes = descedantIds.reduce((acc: TLShape[], currVal) => {
      const shape = this.editor.getShape(currVal);

      if (!shape) return acc;

      return [...acc, shape];
    }, []);

    return descedantShapes;
  };

  getChildren = (currentShapeId: TLShapeId) => {
    const childrenIds =
      this.editor.getSortedChildIdsForParent(currentShapeId) || [];

    const children = childrenIds.reduce((acc: TLShape[], currVal) => {
      const shape = this.editor.getShape(currVal);

      if (!shape) return acc;

      return [...acc, shape];
    }, []);

    return children;
  };

  getLinesFromShapes = (shapes: TLShape[]): MindMapLineType[] => {
    const lineTypes = [
      MIND_MAP_SQUARE_ARROW_SHAPE_ID,
      MIND_MAP_SOFT_ARROW_SHAPE_ID,
    ] as string[];

    const lines = shapes.filter((item) => lineTypes.includes(item.type));

    return lines as MindMapLineType[];
  };

  getChildInputsFromShapes = (shapes: TLShape[]): IMindMapChildInput[] => {
    const childInputs = shapes.filter(
      (item) => MIND_MAP_CHILD_INPUT_SHAPE_ID === item.type
    );

    return childInputs as IMindMapChildInput[];
  };

  setDescedants = (shapeId: TLShapeId) => {
    const shapeWithDescedants = this.getShapeWithDescedants(shapeId);
    this.shapeWithDescedants = shapeWithDescedants;

    const descedants = shapeWithDescedants.filter(
      (item) => item.id !== shapeId
    );

    this.descedants = descedants;
  };

  setChildren = (shapeId: TLShapeId) => {
    const children = this.getChildren(shapeId);
    this.children = children;
  };

  setDescedantLines = () => {
    const descedantLines = this.getLinesFromShapes(this.descedants);
    this.descedantLines = descedantLines;
  };

  setDescedantInputs = () => {
    const descedantInputs = this.getChildInputsFromShapes(this.descedants);
    this.descedantInputs = descedantInputs;
  };

  childrenInputs: IMindMapChildInput[] = [];
  childrenLines: MindMapLineType[] = [];

  setChildrenInputs = () => {
    const childrenInputs = this.getChildInputsFromShapes(this.children);
    this.childrenInputs = childrenInputs;
  };

  setChildrenLines = () => {
    const lines = this.getLinesFromShapes(this.children);
    this.childrenLines = lines;
  };

  updateChildrenInfo = (shape: IMindMapChildInput) => {
    this.setDescedants(shape.id);
    this.setChildren(shape.id);

    this.setDescedantLines();
    this.setDescedantInputs();

    this.setChildrenInputs();
    this.setChildrenLines();
  };

  createLineIfNeeded = (shape: IMindMapChildInput) => {
    const siblings = this.getChildren(shape.parentId as TLShapeId);
    const lines = this.getLinesFromShapes(siblings);

    const lineToShape = lines.find((item) => {
      if (item.parentId !== shape.parentId) return false;
      if (item.props.start.type === 'point') return false;
      if (item.props.end.type === 'point') return false;
      if (item.props.start.boundShapeId !== shape.parentId) return false;
      if (item.props.end.boundShapeId !== shape.id) return false;
      return true;
    });

    if (lineToShape) return;

    let endingAnchorOrientation = 'top';
    let startingAnchorOrientation = 'bottom';
    let anchorEnd = { x: 0.5, y: 0 };
    let anchorStart = { x: 0.5, y: 1 };

    switch (shape.props.side) {
      case 'top':
        endingAnchorOrientation = 'top';
        startingAnchorOrientation = 'bottom';
        anchorEnd = { x: 0.5, y: 1 };
        anchorStart = { x: 0.5, y: 0 };
        break;

      case 'bottom':
        endingAnchorOrientation = 'bottom';
        startingAnchorOrientation = 'top';
        anchorEnd = { x: 0.5, y: 0 };
        anchorStart = { x: 0.5, y: 1 };

        break;

      case 'left':
        endingAnchorOrientation = 'left';
        startingAnchorOrientation = 'right';
        anchorEnd = { x: 1, y: 0.5 };
        anchorStart = { x: 0, y: 0.5 };
        break;

      case 'right':
        endingAnchorOrientation = 'right';
        startingAnchorOrientation = 'left';
        anchorEnd = { x: 0, y: 0.5 };
        anchorStart = { x: 1, y: 0.5 };
        break;

      default:
        break;
    }

    const newLine = {
      id: createShapeId(),
      index: 'a2' as IndexKey,
      isLocked: false,
      meta: {},
      opacity: 1,
      parentId: shape.parentId,
      rotation: 0,
      type: shape.props.arrowId,
      typeName: 'shape',
      x: shape.x,
      y: shape.y,
      props: {
        endingAnchorOrientation,
        startingAnchorOrientation,
        arrowheadEnd: 'none',
        arrowheadStart: 'none',
        bend: 0,
        color: shape.props.borderColor,
        dash: 'draw',
        end: {
          boundShapeId: shape.id,
          isExact: false,
          isPrecise: true,
          normalizedAnchor: anchorEnd,
          type: 'binding',
        },
        size: 1,
        start: {
          boundShapeId: shape.parentId,
          isExact: false,
          isPrecise: true,
          normalizedAnchor: anchorStart,
          type: 'binding',
        },
      },
    } as TLShape;

    this.editor.createShape(newLine);
  };

  deleteOldLineIfNeeded = (shape: IMindMapChildInput) => {
    const prevSiblings = this.getChildren(shape.parentId as TLShapeId);
    const prevParentLines = this.getLinesFromShapes(prevSiblings);

    const prevLineToShape = prevParentLines.find((item) => {
      if (item.parentId !== shape.parentId) return false;
      if (item.props.start.type === 'point') return false;
      if (item.props.end.type === 'point') return false;
      if (item.props.start.boundShapeId !== shape.parentId) return false;
      if (item.props.end.boundShapeId !== shape.id) return false;
      return true;
    });

    if (prevLineToShape) {
      this.editor.deleteShape(prevLineToShape.id);
    }
  };

  handleParentChange = (prev: IMindMapChildInput, next: IMindMapChildInput) => {
    this.deleteOldLineIfNeeded(prev);
    this.createLineIfNeeded(next);
    setTimeout(() => {
      this.updateSiblingsPosition(next);
    }, 100);
  };

  onBeforeUpdate = (prev: IMindMapChildInput, next: IMindMapChildInput) => {
    this.updateChildrenInfo(next);

    if (prev.props.borderColor !== next.props.borderColor) {
      this.onBorderColorChange(
        next.props.borderColor as string,
        next.id,
        next.parentId as TLShapeId
      );
    }

    if (prev.parentId !== next.parentId) {
      this.handleParentChange(prev, next);
    }

    if (prev.props.w !== next.props.w) {
      const descedantShapes = this.getShapeWithDescedants(next.id);
      const inputs = this.getChildInputsFromShapes(descedantShapes);
      const fixedChildren = inputs.map((child) => ({
        ...child,
        isLocked: true,
      }));

      this.editor.updateShapes(fixedChildren);
    }


    const element = document.getElementById(`${prev.id}-quill`);
    if (!element) return;

    const heightWithChildren = this.getHeightWithChildren(next);
    const heightWithChildrenToUse =
      heightWithChildren > MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT
        ? heightWithChildren
        : MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT;

    const hToUse =
      element.offsetHeight > MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT
        ? element.offsetHeight
        : MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT;

    const parent = this.editor.getShapeParent(next);

    const widthWithChildren = this.getWidthWithChildren(next);

    if (
      next.props.side === 'top' &&
      widthWithChildren === next.props.widthWithChildren &&
      hToUse !== next.props.h
    ) {
      const VERTICAL_GAP_BTW_INPUTS = 50;
      const updatedY = -VERTICAL_GAP_BTW_INPUTS - hToUse;

      return {
        ...next,
        y: updatedY,
        props: {
          ...next.props,
          h: hToUse,
        },
      };
    }

    if (
      next.props.side === 'bottom' &&
      widthWithChildren === next.props.widthWithChildren &&
      hToUse !== next.props.h
    ) {
      const VERTICAL_GAP_BTW_INPUTS = 50;
      const children = this.getChildrenInputs(next, next.props.side) || [];
      const updatedChildren = children.map((item) => ({
        ...item,
        y: hToUse + VERTICAL_GAP_BTW_INPUTS,
      }));

      this.editor.updateShapes(updatedChildren);

      return {
        ...next,
        props: {
          ...next.props,
          h: hToUse,
        },
      };
    }

    if (next.props.side === 'top' || next.props.side === 'bottom') {
      if (parent?.type === MIND_MAP_MAIN_INPUT_SHAPE_ID) {
        const isNeedToShiftInputs =
          prev.props.h !== hToUse ||
          prev.props.widthWithChildren !== widthWithChildren;

        const shiftInputsDueToShapeParamsChange = () => {
          const parentInput = this.editor.getShapeParent(
            next.id
          ) as IMindMapMainInput;

          if (!parentInput) return;

          const siblingInputs = this.getChildrenInputs(
            parentInput,
            parentInput.props.side as string
          );

          if (siblingInputs.length === 0) return;

          const siblingInputsWithCurrentShapeUpdated = siblingInputs.map(
            (item) => {
              if (item.id !== next.id) return item;

              return {
                ...item,
                props: {
                  ...item.props,
                  h: hToUse,
                  widthWithChildren,
                },
              };
            }
          );

          const allSiblibgInputsWidth =
            siblingInputsWithCurrentShapeUpdated.reduce((acc, currVal) => {
              return acc + currVal.props.widthWithChildren;
            }, 0);

          const allChildrenInputsWidthWithGaps =
            allSiblibgInputsWidth +
            (siblingInputsWithCurrentShapeUpdated.length - 1) * 20;

          let mostLeftPoint =
            parentInput.props.w / 2 - allChildrenInputsWidthWithGaps / 2;

          const updatedSiblings = siblingInputs.map((item) => {
            const updatedItem = {
              ...item,
              x:
                mostLeftPoint +
                item.props.widthWithChildren / 2 -
                item.props.w / 2,
              props: {
                ...item.props,
                maxXWithChildren: mostLeftPoint + item.props.widthWithChildren,
              },
            };

            const nextItemX = mostLeftPoint + item.props.widthWithChildren + 20;
            mostLeftPoint = nextItemX;

            return updatedItem;
          });

          this.editor.updateShapes(updatedSiblings);
        };

        if (isNeedToShiftInputs) {
          setTimeout(shiftInputsDueToShapeParamsChange, 0);
        }
      }
      if (parent?.type === MIND_MAP_CHILD_INPUT_SHAPE_ID) {
        const isNeedToShiftInputs =
          prev.props.h !== hToUse ||
          prev.props.widthWithChildren !== widthWithChildren;

        const shiftInputsDueToShapeHeightChange = () => {
          const parentInput = this.editor.getShapeParent(
            next.id
          ) as IMindMapChildInput;
          if (!parentInput) return;

          const childrenInputs = this.getChildrenInputs(
            parentInput,
            parentInput.props.side as string
          );

          if (childrenInputs.length === 0) return;

          const chidrenInputsWithCurrentShapeUpdated = childrenInputs.map(
            (item) => {
              if (item.id !== next.id) return item;

              return {
                ...item,
                props: {
                  ...item.props,
                  h: hToUse,
                  widthWithChildren,
                },
              };
            }
          );

          const allChildrenInputsWidth =
            chidrenInputsWithCurrentShapeUpdated.reduce((acc, currVal) => {
              return acc + currVal.props.widthWithChildren;
            }, 0);

          const allChildrenInputsWidthWithGaps =
            allChildrenInputsWidth +
            (chidrenInputsWithCurrentShapeUpdated.length - 1) * 20;

          let mostLeftPoint =
            parentInput.props.w / 2 - allChildrenInputsWidthWithGaps / 2;

          const updatedChildren = childrenInputs.map((item) => {
            const updatedItem = {
              ...item,
              x:
                mostLeftPoint +
                item.props.widthWithChildren / 2 -
                item.props.w / 2,
              props: {
                ...item.props,
                maxXWithChildren: mostLeftPoint + item.props.widthWithChildren,
              },
            };

            const nextItemX = mostLeftPoint + item.props.widthWithChildren + 20;
            mostLeftPoint = nextItemX;

            return updatedItem;
          });

          this.editor.updateShapes(updatedChildren);
          this.editor.updateShape({
            ...parentInput,
            props: {
              ...parentInput.props,
              widthWithChildren:
                parentInput.props.w > widthWithChildren
                  ? parentInput.props.w
                  : widthWithChildren,
            },
          });
        };

        if (isNeedToShiftInputs) {
          setTimeout(shiftInputsDueToShapeHeightChange, 0);
        }
      }

      return {
        ...next,
        props: {
          ...next.props,
          h: hToUse,
          widthWithChildren,
        },
      };
    }

    if (next.props.side === 'right' || next.props.side === 'left') {
      if (parent?.type === MIND_MAP_MAIN_INPUT_SHAPE_ID) {
        const isNeedToShiftInputs =
          prev.props.h !== hToUse ||
          prev.props.heightWithChildren !== heightWithChildrenToUse;

        const shiftInputsDueToShapeHeightChange = () => {
          const parentInput = this.editor.getShapeParent(
            next.id
          ) as IMindMapMainInput;
          if (!parentInput) return;

          const siblingInputs = this.getChildrenInputs(
            parentInput,
            parentInput.props.side as string
          );

          if (siblingInputs.length === 0) return;

          const siblingInputsWithCurrentShapeUpdated = siblingInputs.map(
            (item) => {
              if (item.id !== next.id) return item;

              return {
                ...item,
                props: {
                  ...item.props,
                  h: hToUse,
                  heightWithChildren: heightWithChildrenToUse,
                },
              };
            }
          );

          const allSiblingInputsHeight =
            siblingInputsWithCurrentShapeUpdated.reduce((acc, currVal) => {
              return acc + currVal.props.heightWithChildren;
            }, 0);

          const allChildrenInputsHeightWithGaps =
            allSiblingInputsHeight +
            (siblingInputsWithCurrentShapeUpdated.length - 1) * 20;

          let highestPoint =
            parentInput.props.h / 2 - allChildrenInputsHeightWithGaps / 2;

          const updatedSiblings = siblingInputs.map((item) => {
            const updatedItem = {
              ...item,
              y:
                highestPoint +
                item.props.heightWithChildren / 2 -
                item.props.h / 2,
              props: {
                ...item.props,
                maxYWithChildren: highestPoint + item.props.heightWithChildren,
              },
            };

            const nextItemY = highestPoint + item.props.heightWithChildren + 20;
            highestPoint = nextItemY;

            return updatedItem;
          });

          this.editor.updateShapes(updatedSiblings);
        };

        if (isNeedToShiftInputs) {
          setTimeout(shiftInputsDueToShapeHeightChange, 0);
        }
      }
      if (parent?.type === MIND_MAP_CHILD_INPUT_SHAPE_ID) {
        const isNeedToShiftInputs =
          prev.props.h !== hToUse ||
          prev.props.heightWithChildren !== heightWithChildrenToUse;

        const shiftInputsDueToShapeHeightChange = () => {
          const parentInput = this.editor.getShapeParent(
            next.id
          ) as IMindMapChildInput;
          if (!parentInput) return;

          const childrenInputs = this.getChildrenInputs(
            parentInput,
            parentInput.props.side as string
          );

          if (childrenInputs.length === 0) return;

          const clidrenInputsWithCurrentShapeUpdated = childrenInputs.map(
            (item) => {
              if (item.id !== next.id) return item;

              return {
                ...item,
                props: {
                  ...item.props,
                  h: hToUse,
                  heightWithChildren: heightWithChildrenToUse,
                },
              };
            }
          );

          const allChildrenInputsHeight =
            clidrenInputsWithCurrentShapeUpdated.reduce((acc, currVal) => {
              return acc + currVal.props.heightWithChildren;
            }, 0);

          const allChildrenInputsHeightWithGaps =
            allChildrenInputsHeight +
            (clidrenInputsWithCurrentShapeUpdated.length - 1) * 20;

          let highestPoint =
            parentInput.props.h / 2 - allChildrenInputsHeightWithGaps / 2;

          const updatedChildren = childrenInputs.map((item) => {
            const updatedItem = {
              ...item,
              y:
                highestPoint +
                item.props.heightWithChildren / 2 -
                item.props.h / 2,
              props: {
                ...item.props,
                maxYWithChildren: highestPoint + item.props.heightWithChildren,
              },
            };

            const nextItemY = highestPoint + item.props.heightWithChildren + 20;
            highestPoint = nextItemY;

            return updatedItem;
          });

          this.editor.updateShapes(updatedChildren);
          this.editor.updateShape({
            ...parentInput,
            props: {
              ...parentInput.props,
              heightWithChildren:
                parentInput.props.h > heightWithChildrenToUse
                  ? parentInput.props.h
                  : heightWithChildrenToUse,
            },
          });
        };

        if (isNeedToShiftInputs) {
          setTimeout(shiftInputsDueToShapeHeightChange, 0);
        }
      }

      return {
        ...next,
        props: {
          ...next.props,
          h: hToUse,
          heightWithChildren: heightWithChildrenToUse,
        },
      };
    }
  };

  updateSiblingsPosition = (shape: IMindMapChildInput) => {
    if (shape.props.side === 'right' || shape.props.side === 'left') {
      const parentInput = this.editor.getShapeParent(
        shape.id
      ) as MindMapInputType;

      const newX =
        shape.props.side === 'right'
          ? parentInput.props.w + HORIZONTAL_GAP_BTW_INPUTS
          : -HORIZONTAL_GAP_BTW_INPUTS - shape.props.w;

      const siblingInputs = this.getChildrenInputs(
        parentInput,
        shape.props.side as string
      );

      const allSiblingInputsHeight = siblingInputs.reduce((acc, currVal) => {
        return acc + currVal.props.heightWithChildren;
      }, 0);

      const allChildrenInputsHeightWithGaps =
        allSiblingInputsHeight + (siblingInputs.length - 1) * 20;

      let highestPoint =
        parentInput.props.h / 2 - allChildrenInputsHeightWithGaps / 2;

      const updatedSiblings = siblingInputs
        .sort((a, b) => a.props.index - b.props.index)
        .map((item) => {
          const updatedItem = {
            ...item,
            x: newX,
            y:
              highestPoint +
              item.props.heightWithChildren / 2 -
              item.props.h / 2,
            props: {
              ...item.props,
              maxYWithChildren: highestPoint + item.props.heightWithChildren,
            },
          };

          const nextItemY = highestPoint + item.props.heightWithChildren + 20;
          highestPoint = nextItemY;

          return updatedItem;
        });

      this.editor.updateShapes(updatedSiblings);
    }

    if (shape.props.side === 'top' || shape.props.side === 'bottom') {
      const parentInput = this.editor.getShapeParent(
        shape.id
      ) as IMindMapMainInput;

      const newY =
        shape.props.side === 'top'
          ? -VERTICAL_GAP_BTW_INPUTS - MIND_MAP_CHILD_INPUT_DEFAULT_HEIGHT
          : parentInput.props.h + VERTICAL_GAP_BTW_INPUTS;

      const siblingInputs = this.getChildrenInputs(
        parentInput,
        shape.props.side as string
      );

      const allSiblibgInputsWidth = siblingInputs.reduce((acc, currVal) => {
        return acc + currVal.props.widthWithChildren;
      }, 0);

      const allChildrenInputsWidthWithGaps =
        allSiblibgInputsWidth + (siblingInputs.length - 1) * 20;

      let mostLeftPoint =
        parentInput.props.w / 2 - allChildrenInputsWidthWithGaps / 2;

      const updatedSiblings = siblingInputs
        .sort((a, b) => a.props.index - b.props.index)
        .map((item) => {
          const updatedItem = {
            ...item,
            y: newY,
            x:
              mostLeftPoint +
              item.props.widthWithChildren / 2 -
              item.props.w / 2,
            props: {
              ...item.props,
              maxXWithChildren: mostLeftPoint + item.props.widthWithChildren,
            },
          };

          const nextItemX = mostLeftPoint + item.props.widthWithChildren + 20;
          mostLeftPoint = nextItemX;

          return updatedItem;
        });

      this.editor.updateShapes(updatedSiblings);
    }
  };

  getHeightWithChildren = (shape: IMindMapChildInput): number => {
    const childrenIds = this.editor.getSortedChildIdsForParent(shape.id) || [];
    if (!childrenIds.length) return shape.props.h;

    const children = childrenIds.map((id) => this.editor.getShape(id));
    const childrenInputs = children.filter(
      (shape) => shape?.type === MIND_MAP_CHILD_INPUT_SHAPE_ID
    ) as IMindMapChildInput[];

    if (!childrenInputs.length) return shape.props.h;
    const childrenInputsHeights = childrenInputs.map((shape) =>
      this.getHeightWithChildren(shape)
    );

    const heightOfAllChildren =
      childrenInputsHeights.reduce((acc, currVal) => acc + currVal, 0) +
      20 * (childrenInputs.length - 1);
    const resultHeight =
      shape.props.h > heightOfAllChildren ? shape.props.h : heightOfAllChildren;

    return resultHeight;
  };

  getWidthWithChildren = (shape: IMindMapChildInput): number => {
    const childrenIds = this.editor.getSortedChildIdsForParent(shape.id) || [];

    if (!childrenIds.length) return shape.props.w;

    const children = childrenIds.map((id) => this.editor.getShape(id));

    const childrenInputs = children.filter(
      (item) =>
        item?.type === MIND_MAP_CHILD_INPUT_SHAPE_ID &&
        (item as IMindMapChildInput).props?.side === shape.props.side
    ) as IMindMapChildInput[];

    if (!childrenInputs.length) return shape.props.w;

    const childrenInputsWidths = childrenInputs.map((shape) =>
      this.getWidthWithChildren(shape)
    );

    const widthOfAllChildren =
      childrenInputsWidths.reduce((acc, currVal) => acc + currVal, 0) +
      20 * (childrenInputs.length - 1);

    const resultWidth =
      shape.props.w > widthOfAllChildren ? shape.props.w : widthOfAllChildren;

    return resultWidth;
  };

  canDropShapes = (shape: IMindMapChildInput, shapes: TLShape[]) => {
    return shapes.every((item) => item.type === MIND_MAP_CHILD_INPUT_SHAPE_ID);
  };

  onDragShapesOver: TLOnDragHandler<
    IMindMapChildInput,
    {
      shouldHint: boolean;
    }
  > = (shape, shapes) => {
    if (
      shapes.every(
        (item) =>
          item.type === MIND_MAP_CHILD_INPUT_SHAPE_ID &&
          (item as IMindMapChildInput).props.side === shape.props.side
      )
    ) {
      return { shouldHint: true };
    }

    return { shouldHint: false };
  };

  dropShapeHandler = (
    currenShape: IMindMapChildInput,
    droppedShape: TLShape
  ) => {
    if (droppedShape.type !== MIND_MAP_CHILD_INPUT_SHAPE_ID) return;
    if (
      (droppedShape as IMindMapChildInput).props.side !== currenShape.props.side
    )
      return;
    this.updateChildrenInfo(currenShape);

    const currentHighestIndex = this.childrenInputs.reduce((acc, currVal) => {
      if (
        currVal.props.side !== (droppedShape as IMindMapChildInput).props.side
      )
        return acc;
      if (acc > currVal.props.index) return acc;
      return currVal.props.index;
    }, 0);

    const shapeDataToUpdate: IMindMapChildInput = {
      ...(droppedShape as IMindMapChildInput),
      parentId: currenShape.id,
      props: {
        ...(droppedShape as IMindMapChildInput).props,
        index: currentHighestIndex + 1,
      },
    };

    this.editor.updateShape(shapeDataToUpdate);
  };

  onDropShapesOver: TLOnDragHandler<IMindMapChildInput> = (shape, shapes) => {
    for (let i = 0; i < shapes.length; i++) {
      this.dropShapeHandler(shape, shapes[i]);
    }
  };
}
