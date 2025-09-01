import {
  Box,
  Geometry2d,
  Rectangle2d,
  ShapeUtil,
  TLOnBeforeUpdateHandler,
  TLOnDragHandler,
  TLOnEditEndHandler,
  TLOnResizeEndHandler,
  TLOnResizeHandler,
  TLShape,
  TLShapeId,
  Vec,
  resizeBox,
  toDomPrecision,
  useValue,
} from '@tldraw/editor';
import { IMindMapMainInput } from './mind-map-main-input-types';
import { useEffect, useState } from 'react';
import { mindMapMainInputProps } from './mind-map-main-input-props';
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
  MIND_MAP_MAIN_INPUT_DEFAULT_HEIGHT,
  MIND_MAP_MAIN_INPUT_DEFAULT_WIDTH,
} from '@app/constants/whiteboard/constants';
import {
  DocablyMindMapBorder,
  DocablyMindMapBorderColor,
  DocablyMindMapSide,
  DokablyTextColor,
} from '@app/constants/whiteboard/whiteboard-styles';
import { useTextMesurements } from '@widgets/whiteboard/custom-shapes/useTextMesurements';
import { IMindMapChildInput } from '../child-input/mind-map-child-input-types';
import { IMindMapSoftArrow } from '../mind-map-soft-arrow/types';
import { IMindMapSquareArrow } from '../mind-map-square-arrow/types';
import { TextContentForCustomShape } from '@widgets/whiteboard/custom-shapes/text-content-for-custom-shape/TextContentForCustomShape';
import { showLinkPanelIfNeeded } from '@widgets/whiteboard/text-link/utils';

type MindMapLineType = IMindMapSoftArrow | IMindMapSquareArrow;

export class MindMapMainInputUtil extends ShapeUtil<IMindMapMainInput> {
  children: TLShape[] = [];
  descedants: TLShape[] = [];
  shapeWithDescedants: TLShape[] = [];

  descedantLines: MindMapLineType[] = [];
  descedantInputs: IMindMapChildInput[] = [];

  static override type = MIND_MAP_MAIN_INPUT_SHAPE_ID;
  static override props = mindMapMainInputProps;

  canEdit = () => true;
  override isAspectRatioLocked = (_shape: IMindMapMainInput) => false;

  override canResize = (_shape: IMindMapMainInput) => true;
  override canBind = (_shape: IMindMapMainInput) => true;

  canDropShapes = (shape: IMindMapMainInput, shapes: TLShape[]) => {
    return shapes.every((item) => item.type === MIND_MAP_CHILD_INPUT_SHAPE_ID);
  };

  getGeometry(shape: IMindMapMainInput): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }
  getDefaultProps(): IMindMapMainInput['props'] {
    return {
      w: MIND_MAP_MAIN_INPUT_DEFAULT_WIDTH,
      h: MIND_MAP_MAIN_INPUT_DEFAULT_HEIGHT,
      heightWithChildren: MIND_MAP_MAIN_INPUT_DEFAULT_HEIGHT,
      widthWithChildren: MIND_MAP_MAIN_INPUT_DEFAULT_WIDTH,
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
      maxYWithChildren: MIND_MAP_MAIN_INPUT_DEFAULT_HEIGHT / 2,
      maxXWithChildren: MIND_MAP_MAIN_INPUT_DEFAULT_WIDTH / 2,
      arrowId: MIND_MAP_SOFT_ARROW_SHAPE_ID,
      border: DocablyMindMapBorder.defaultValue,
      textContents: '',
    };
  }

  getBounds(shape: IMindMapMainInput) {
    return new Box(0, 0, shape.props.w, shape.props.h);
  }

  getCenter(shape: IMindMapMainInput) {
    return new Vec(shape.props.w / 2, shape.props.h / 2);
  }

  component(shape: IMindMapMainInput) {
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

    return (
      <div>
        <div
          onPointerDown={hadleClick}
          style={{
            position: 'absolute',
            width: bounds.w,
            height: 'auto',
            minHeight: MIND_MAP_MAIN_INPUT_DEFAULT_HEIGHT,
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
              minHeight: MIND_MAP_MAIN_INPUT_DEFAULT_HEIGHT,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              paddingLeft: '44px',
              paddingRight: '44px',
            }}
          >
            <TextContentForCustomShape
              placeholder='Type something'
              editingShape={editingShapeLocal}
              id={id}
              //@ts-ignore
              type={MIND_MAP_MAIN_INPUT_SHAPE_ID}
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

  indicator(shape: IMindMapMainInput) {
    const bounds = this.getBounds(shape);
    return (
      <rect
        width={toDomPrecision(bounds.width)}
        height={toDomPrecision(bounds.height)}
      />
    );
  }

  // Events
  override onResize: TLOnResizeHandler<IMindMapMainInput> = (shape, info) => {

    const descedantShapes = this.getShapeWithDescedants(shape.id);
    const inputs = this.getChildInputsFromShapes(descedantShapes);
    const fixedChildren = inputs.map((child) => ({
      ...child,
      isLocked: true,
    }));

    this.editor.updateShapes(fixedChildren);

    const { scaleX } = info;

    const newWidth = Math.max(
      shape.props.w * scaleX,
      MIND_MAP_MAIN_INPUT_DEFAULT_WIDTH
    );
    const deltaX = shape.props.w - newWidth;

    return {
      ...shape,
      x: info.handle === 'left' ? shape.x + deltaX : shape.x,
      props: {
        ...shape.props,
        w: newWidth,
      },
    };

  };

  onResizeEnd: TLOnResizeEndHandler<IMindMapMainInput> = (shape) => {

    const descedantShapes = this.getShapeWithDescedants(shape.id);
    const inputs = this.getChildInputsFromShapes(descedantShapes);
    const fixedChildren = inputs.map((child) => ({
      ...child,
      isLocked: false,
    }));

    this.editor.updateShapes(fixedChildren);

    this.editor.setEditingShape(shape.id);
    const quill = getQuillForShape(shape.id);

    if (!quill) return;

    quill.enable();
    quill.focus();
  };

  onEditEnd: TLOnEditEndHandler<IMindMapMainInput> = (shape) => {
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

  getChildInputsFromSide = (side: string) => {
    const childInputsFromSide = this.children.filter((shape) => {
      if (shape.type !== MIND_MAP_CHILD_INPUT_SHAPE_ID) return false;

      if ((shape as IMindMapChildInput).props.side !== side) return false;
      return true;
    });

    return childInputsFromSide as IMindMapChildInput[];
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

  changeConnectionLinesType = (newArrowType: string) => {
    const updatedShapes = this.descedantLines.map((item) => ({
      ...item,
      type: newArrowType,
    }));

    this.editor.createShapes(updatedShapes);
  };

  updateDescedantInputs = (newArrowType: string) => {
    const updatedShapes = this.descedantInputs.map((item) => ({
      ...item,
      props: {
        ...item.props,
        arrowId: newArrowType,
      },
    }));

    this.editor.updateShapes(updatedShapes);
  };

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

  updateChildrenInfo = (shape: IMindMapMainInput) => {
    this.setDescedants(shape.id);
    this.setChildren(shape.id);

    this.setDescedantLines();
    this.setDescedantInputs();

    this.setChildrenInputs();
    this.setChildrenLines();
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

  onLineTypeChange = (newLineType: string) => {
    this.changeConnectionLinesType(newLineType);
    this.updateDescedantInputs(newLineType);
  };

  clearOldLinesUponCopyPaste = () => {
    const linesToDelete = this.descedantLines.reduce(
      (acc: TLShapeId[], currVal: MindMapLineType) => {
        if (currVal.props.start.type === 'point') return acc;
        const startInput = this.shapeWithDescedants.find(
          (item) => item.id === (currVal.props.start as any).boundShapeId
        );

        if (currVal.props.end.type === 'point') return acc;
        const endInput = this.shapeWithDescedants.find(
          (item) => item.id === (currVal.props.end as any).boundShapeId
        );

        if (startInput && endInput) return acc;

        return [...acc, currVal.id];
      },
      []
    );

    this.editor.deleteShapes(linesToDelete);
  };

  onBeforeUpdate: TLOnBeforeUpdateHandler<IMindMapMainInput> = (prev, next) => {
    this.updateChildrenInfo(next);

    if (prev.props.arrowId !== next.props.arrowId) {
      this.onLineTypeChange(next.props.arrowId);
    }

    if (prev.props.borderColor !== next.props.borderColor) {
      this.changeColorOfDescedants(next.props.borderColor as string);
    }

    this.clearOldLinesUponCopyPaste();

    const element = document.getElementById(`${prev.id}-quill`);
    if (!element) return;

    const hToUse =
      element.offsetHeight > MIND_MAP_MAIN_INPUT_DEFAULT_HEIGHT
        ? element.offsetHeight
        : MIND_MAP_MAIN_INPUT_DEFAULT_HEIGHT;

    if (hToUse !== next.props.h) {
      const VERTICAL_GAP_BTW_INPUTS = 50;

      const children = this.getChildInputsFromSide('bottom') || [];

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

    return next;
  };

  dropShapeHandler = (
    currenShape: IMindMapMainInput,
    droppedShape: TLShape
  ) => {
    if (droppedShape.type !== MIND_MAP_CHILD_INPUT_SHAPE_ID) return;
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

  onDropShapesOver: TLOnDragHandler<IMindMapMainInput> = (shape, shapes) => {
    for (let i = 0; i < shapes.length; i++) {
      this.dropShapeHandler(shape, shapes[i]);
    }
  };

  onDragShapesOver: TLOnDragHandler<
    IMindMapMainInput,
    {
      shouldHint: boolean;
    }
  > = (shape, shapes) => {
    if (shapes.every((item) => item.type === MIND_MAP_CHILD_INPUT_SHAPE_ID && isSidesInOnenDirection(
      (item as IMindMapChildInput).props.side as string, shape.props.side as string
    ))) {
      return { shouldHint: true };
    }

    return { shouldHint: false };
  };
}

function isSidesInOnenDirection(sideA: string, sideB: string) {
  const vericalSides = [
    "top", "bottom", 'all'
  ]

  const horisontalSides = [
    "right", "left", 'all'
  ]

  switch (sideA) {
    case 'bottom':
    case 'top':
      return vericalSides.includes(sideB)

    case 'left':
    case 'right':
      return horisontalSides.includes(sideB)

    default:
      return false;
  }
}