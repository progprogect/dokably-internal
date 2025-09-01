import {
  TLDokablyMindMapBorder,
  TLDokablyMindMapBorderColor,
  TLDokablyMindMapSide,
  TLDokablyTextColor,
} from '../../../../app/constants/whiteboard/whiteboard-styles';
import { MIND_MAP_CHILD_INPUT_SHAPE_ID_TYPE } from '@app/constants/whiteboard/shape-ids';
import {
  TLDokablyAlign,
  TLDokablyBgColor,
  TLDokablySize,
  TLDokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';
import { TLBaseShape } from '@tldraw/editor';

export type IMindMapChildInput = TLBaseShape<
  MIND_MAP_CHILD_INPUT_SHAPE_ID_TYPE,
  {
    w: number;
    h: number;
    color: TLDokablyTextColor;
    borderColor: TLDokablyMindMapBorderColor;
    fill: TLDokablyBgColor;
    size: TLDokablySize;
    fontFamily: string;
    fontSize: number;
    text: string;
    align: TLDokablyAlign;
    verticalAlign: TLDokablyVerticalAlign;
    url: string;
    side: TLDokablyMindMapSide;
    index: number;
    heightWithChildren: number;
    widthWithChildren: number;
    maxYWithChildren: number;
    maxXWithChildren: number;
    arrowId: string,
    border: TLDokablyMindMapBorder,
    textContents: string,
  }
>;
