import {
  ArrowShapeArrowheadEndStyle,
  ArrowShapeArrowheadStartStyle,
  TLDefaultDashStyle,
  TLDocablyMindMapLineColor,
  TLEndAnchorPosition,
  TLStartAnchorPosition,
} from '@app/constants/whiteboard/whiteboard-styles';
import { T, TLArrowShapeTerminal, TLBaseShape } from '@tldraw/tldraw';
import { MIND_MAP_SOFT_ARROW_SHAPE_ID_TYPE } from '@app/constants/whiteboard/shape-ids';

export type IMindMapSoftArrow = TLBaseShape<
  MIND_MAP_SOFT_ARROW_SHAPE_ID_TYPE,
  {
    color: TLDocablyMindMapLineColor;
    dash: TLDefaultDashStyle;
    size: number;
    arrowheadStart: T.TypeOf<typeof ArrowShapeArrowheadStartStyle>;
    arrowheadEnd: T.TypeOf<typeof ArrowShapeArrowheadEndStyle>;
    start: TLArrowShapeTerminal;
    end: TLArrowShapeTerminal;
    bend: number;
    startingAnchorOrientation: TLStartAnchorPosition;
    endingAnchorOrientation: TLEndAnchorPosition;
  }
>;
