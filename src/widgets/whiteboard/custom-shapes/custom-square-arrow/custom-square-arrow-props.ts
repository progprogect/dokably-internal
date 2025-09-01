import { ShapeProps, arrowShapeProps } from '@tldraw/tldraw';
import { T } from '@tldraw/validate';
import { ICustomSquareArrow } from './custom-square-arrow-types';
import {
  ArrowShapeArrowheadEndStyle,
  ArrowShapeArrowheadStartStyle,
  DefaultDashStyle,
  DocablyArrowColor,
} from '@app/constants/whiteboard/whiteboard-styles';

export const customSquareArrowProps: ShapeProps<ICustomSquareArrow> = {
  color: DocablyArrowColor,
  dash: DefaultDashStyle,
  size: T.number,
  arrowheadStart: ArrowShapeArrowheadStartStyle,
  arrowheadEnd: ArrowShapeArrowheadEndStyle,
  start: arrowShapeProps.start,
  end: arrowShapeProps.end,
  bend: T.number,
};
