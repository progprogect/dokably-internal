import { ShapeProps, arrowShapeProps } from '@tldraw/tldraw';
import { T } from '@tldraw/validate';
import { ICustomStraightArrow } from './custom-straight-arrow-types';
import {
  ArrowShapeArrowheadEndStyle,
  ArrowShapeArrowheadStartStyle,
  DefaultDashStyle,
  DocablyArrowColor,
  DokablyEndAnchorPosition,
  DokablyStartAnchorPosition,
} from '@app/constants/whiteboard/whiteboard-styles';

export const customStraightArrowShapeProps: ShapeProps<ICustomStraightArrow> = {
  color: DocablyArrowColor,
  dash: DefaultDashStyle,
  size: T.number,
  arrowheadStart: ArrowShapeArrowheadStartStyle,
  arrowheadEnd: ArrowShapeArrowheadEndStyle,
  start: arrowShapeProps.start,
  end: arrowShapeProps.end,
  bend: T.number,
};
