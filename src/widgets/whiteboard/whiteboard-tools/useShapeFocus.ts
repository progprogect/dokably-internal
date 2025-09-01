import {
  useEditor,
} from '@tldraw/editor';
import { useCallback } from 'react';
import {
  CUSTOM_ARROW_RIGHT_SHAPE_ID,
  CUSTOM_BUBBLE_SHAPE_ID,
  CUSTOM_ELLIPSE_SHAPE_ID,
  CUSTOM_NOTE_SHAPE_ID,
  CUSTOM_PARALLELOGRAM_SHAPE_ID,
  CUSTOM_POLYGON_SHAPE_ID,
  CUSTOM_RECTANGLE_SHAPE_ID,
  CUSTOM_RECTANGLE_SOFT_SHAPE_ID,
  CUSTOM_RHOMBUS_SHAPE_ID,
  CUSTOM_SEXAGON_SHAPE_ID,
  CUSTOM_STAR_SHAPE_ID,
  CUSTOM_TEXT_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import { ICustomNote } from '../custom-shapes/custom-note/custom-note-types';
import {
  CUSTOM_ARROW_RIGHT_SHAPE_DEFAULT_HEIGHT,
  CUSTOM_ARROW_RIGHT_SHAPE_DEFAULT_WIDTH,
  CUSTOM_BUBBLE_SHAPE_DEFAULT_HEIGHT,
  CUSTOM_BUBBLE_SHAPE_DEFAULT_WIDTH,
  CUSTOM_ELLIPSE_SHAPE_DEFAULT_HEIGHT,
  CUSTOM_ELLIPSE_SHAPE_DEFAULT_WIDTH,
  CUSTOM_NOTE_SHAPE_DEFAULT_HEIGHT,
  CUSTOM_NOTE_SHAPE_DEFAULT_WIDTH,
  CUSTOM_PARALLELOGRAM_SHAPE_DEFAULT_HEIGHT,
  CUSTOM_PARALLELOGRAM_SHAPE_DEFAULT_WIDTH,
  CUSTOM_POLYGON_SHAPE_DEFAULT_HEIGHT,
  CUSTOM_POLYGON_SHAPE_DEFAULT_WIDTH,
  CUSTOM_RECTANGLE_SHAPE_DEFAULT_HEIGHT,
  CUSTOM_RECTANGLE_SHAPE_DEFAULT_WIDTH,
  CUSTOM_RECTANGLE_SOFT_SHAPE_DEFAULT_HEIGHT,
  CUSTOM_RECTANGLE_SOFT_SHAPE_DEFAULT_WIDTH,
  CUSTOM_RHOMBUS_SHAPE_DEFAULT_HEIGHT,
  CUSTOM_RHOMBUS_SHAPE_DEFAULT_WIDTH,
  CUSTOM_SEXAGON_SHAPE_DEFAULT_HEIGHT,
  CUSTOM_SEXAGON_SHAPE_DEFAULT_WIDTH,
  CUSTOM_STAR_SHAPE_DEFAULT_HEIGHT,
  CUSTOM_STAR_SHAPE_DEFAULT_WIDTH,
  CUSTOM_TEXT_SHAPE_DEFAULT_HEIGHT,
  CUSTOM_TEXT_SHAPE_DEFAULT_WIDTH,
} from '@app/constants/whiteboard/constants';
import {
  ICustomArrowRight,
  ICustomBubble,
  ICustomEllipse,
  ICustomParallelogram,
  ICustomPolygon,
  ICustomRectangle,
  ICustomRectangleSoft,
  ICustomRhombus,
  ICustomSexagon,
  ICustomStar,
  ICustomText,
} from '../custom-shapes/custom-shape-types';

export type ShapeTypesToFocus =
  | ICustomArrowRight
  | ICustomBubble
  | ICustomEllipse
  | ICustomNote
  | ICustomParallelogram
  | ICustomPolygon
  | ICustomRectangle
  | ICustomRectangleSoft
  | ICustomRhombus
  | ICustomSexagon
  | ICustomStar
  | ICustomText;

const shapesToFocusDetails = [
  {
    type: CUSTOM_NOTE_SHAPE_ID,
    w: CUSTOM_NOTE_SHAPE_DEFAULT_WIDTH,
    h: CUSTOM_NOTE_SHAPE_DEFAULT_HEIGHT,
  },
  {
    type: CUSTOM_RECTANGLE_SHAPE_ID,
    w: CUSTOM_RECTANGLE_SHAPE_DEFAULT_WIDTH,
    h: CUSTOM_RECTANGLE_SHAPE_DEFAULT_HEIGHT,
  },
  {
    type: CUSTOM_RECTANGLE_SOFT_SHAPE_ID,
    w: CUSTOM_RECTANGLE_SOFT_SHAPE_DEFAULT_WIDTH,
    h: CUSTOM_RECTANGLE_SOFT_SHAPE_DEFAULT_HEIGHT,
  },
  {
    type: CUSTOM_ELLIPSE_SHAPE_ID,
    w: CUSTOM_ELLIPSE_SHAPE_DEFAULT_WIDTH,
    h: CUSTOM_ELLIPSE_SHAPE_DEFAULT_HEIGHT,
  },
  {
    type: CUSTOM_POLYGON_SHAPE_ID,
    w: CUSTOM_POLYGON_SHAPE_DEFAULT_WIDTH,
    h: CUSTOM_POLYGON_SHAPE_DEFAULT_HEIGHT,
  },
  {
    type: CUSTOM_RHOMBUS_SHAPE_ID,
    w: CUSTOM_RHOMBUS_SHAPE_DEFAULT_WIDTH,
    h: CUSTOM_RHOMBUS_SHAPE_DEFAULT_HEIGHT,
  },
  {
    type: CUSTOM_BUBBLE_SHAPE_ID,
    w: CUSTOM_BUBBLE_SHAPE_DEFAULT_WIDTH,
    h: CUSTOM_BUBBLE_SHAPE_DEFAULT_HEIGHT,
  },
  {
    type: CUSTOM_PARALLELOGRAM_SHAPE_ID,
    w: CUSTOM_PARALLELOGRAM_SHAPE_DEFAULT_WIDTH,
    h: CUSTOM_PARALLELOGRAM_SHAPE_DEFAULT_HEIGHT,
  },
  {
    type: CUSTOM_STAR_SHAPE_ID,
    w: CUSTOM_STAR_SHAPE_DEFAULT_WIDTH,
    h: CUSTOM_STAR_SHAPE_DEFAULT_HEIGHT,
  },
  {
    type: CUSTOM_ARROW_RIGHT_SHAPE_ID,
    w: CUSTOM_ARROW_RIGHT_SHAPE_DEFAULT_WIDTH,
    h: CUSTOM_ARROW_RIGHT_SHAPE_DEFAULT_HEIGHT,
  },
  {
    type: CUSTOM_SEXAGON_SHAPE_ID,
    w: CUSTOM_SEXAGON_SHAPE_DEFAULT_WIDTH,
    h: CUSTOM_SEXAGON_SHAPE_DEFAULT_HEIGHT,
  },
  {
    type: CUSTOM_TEXT_SHAPE_ID,
    w: CUSTOM_TEXT_SHAPE_DEFAULT_WIDTH,
    h: CUSTOM_TEXT_SHAPE_DEFAULT_HEIGHT,
  },
];

export const useShapeFocus = () => {
  const editor = useEditor();

  const focusShapeUponCreationIfNeeded = useCallback(
    (shape: ShapeTypesToFocus) => {
      const shapeToFocus = shapesToFocusDetails.find(
        (item) => item.type === shape.type
      );

      if (!shapeToFocus) return;

      if (
        shapeToFocus.h === shape.props.h &&
        shapeToFocus.w === shape.props.w
      ) {
        return editor.setEditingShape(shape.id);
      }
    },
    [editor]
  );

  return focusShapeUponCreationIfNeeded;
};
