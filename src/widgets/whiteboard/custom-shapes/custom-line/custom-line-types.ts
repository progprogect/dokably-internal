import {
  TLDefaultDashStyle,
  TLDokablyArrowColor,
  TLLineShapeSplineStyle,
} from '@app/constants/whiteboard/whiteboard-styles';
import { IndexKey, TLBaseShape } from '@tldraw/tldraw';
import { CUSTOM_LINE_SHAPE_ID_TYPE } from '@app/constants/whiteboard/shape-ids';

export type ICustomLine = TLBaseShape<
  CUSTOM_LINE_SHAPE_ID_TYPE,
  {
    color: TLDokablyArrowColor;
    dash: TLDefaultDashStyle;
    size: number;
    spline: TLLineShapeSplineStyle;
    points: Record<string, { id: string; index: IndexKey; x: number; y: number; }>;
  }
>;
