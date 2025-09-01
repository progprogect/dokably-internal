import {
  ArrowShapeArrowheadEndStyle,
  ArrowShapeArrowheadStartStyle,
  TLDefaultDashStyle,
  TLDokablyArrowColor,
} from '@app/constants/whiteboard/whiteboard-styles';
import { T, TLArrowShapeTerminal, TLBaseShape } from '@tldraw/tldraw';
import { CUSTOM_SOFT_ARROW_SHAPE_ID_TYPE } from '@app/constants/whiteboard/shape-ids';

export type ICustomSoftArrow = TLBaseShape<
  CUSTOM_SOFT_ARROW_SHAPE_ID_TYPE,
  {
    color: TLDokablyArrowColor;
    dash: TLDefaultDashStyle;
    size: number;
    arrowheadStart: T.TypeOf<typeof ArrowShapeArrowheadStartStyle>;
    arrowheadEnd: T.TypeOf<typeof ArrowShapeArrowheadEndStyle>;
    start: TLArrowShapeTerminal;
    end: TLArrowShapeTerminal;
    bend: number;
  }
>;
