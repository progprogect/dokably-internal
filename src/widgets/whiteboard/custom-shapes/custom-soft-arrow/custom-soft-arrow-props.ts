import { ShapeProps, arrowShapeProps } from '@tldraw/tldraw';
import { T } from '@tldraw/validate';
import { ICustomSoftArrow } from './custom-soft-arrow-types';
import {
  ArrowShapeArrowheadEndStyle,
  ArrowShapeArrowheadStartStyle,
  DefaultDashStyle,
  DocablyArrowColor,
} from '@app/constants/whiteboard/whiteboard-styles';

export const customSoftArrowProps: ShapeProps<ICustomSoftArrow> = {
  color: DocablyArrowColor,
  dash: DefaultDashStyle,
  size: T.number,
  arrowheadStart: ArrowShapeArrowheadStartStyle,
  arrowheadEnd: ArrowShapeArrowheadEndStyle,
  start: arrowShapeProps.start,
  end: arrowShapeProps.end,
  bend: T.number,
};
