import { ShapeProps, T, lineShapeProps } from '@tldraw/tldraw';
import {
  DefaultDashStyle,
  DocablyArrowColor,
  DokablyLineShapeSplineStyle,
} from '@app/constants/whiteboard/whiteboard-styles';
import { ICustomLine } from './custom-line-types';

export const customLineShapeProps: ShapeProps<ICustomLine> = {
  ...lineShapeProps,
  color: DocablyArrowColor,
  dash: DefaultDashStyle,
  size: T.number,
  spline: DokablyLineShapeSplineStyle,
};
