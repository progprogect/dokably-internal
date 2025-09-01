import { ShapeProps, arrowShapeProps } from '@tldraw/tldraw';
import { T } from '@tldraw/validate';
import { IMindMapSquareArrow } from './types';
import {
  ArrowShapeArrowheadEndStyle,
  ArrowShapeArrowheadStartStyle,
  DefaultDashStyle,
  DocablyMindMapLineColor,
  DokablyEndAnchorPosition,
  DokablyStartAnchorPosition,
} from '@app/constants/whiteboard/whiteboard-styles';

export const mindMapSquareArrowProps: ShapeProps<IMindMapSquareArrow> = {
  color: DocablyMindMapLineColor,
  dash: DefaultDashStyle,
  size: T.number,
  arrowheadStart: ArrowShapeArrowheadStartStyle,
  arrowheadEnd: ArrowShapeArrowheadEndStyle,
  start: arrowShapeProps.start,
  end: arrowShapeProps.end,
  bend: T.number,
  startingAnchorOrientation: DokablyStartAnchorPosition,
  endingAnchorOrientation: DokablyEndAnchorPosition,
};
