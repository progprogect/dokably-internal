import {
  TLDokablyMindMapBorder,
  TLDokablyMindMapSide,
  TLDokablyTextColor,
} from '../../../../app/constants/whiteboard/whiteboard-styles';
import { MIND_MAP_MAIN_INPUT_SHAPE_ID_TYPE } from '@app/constants/whiteboard/shape-ids';
import {
  TLDokablyAlign,
  TLDokablyMindMapBorderColor,
  TLDokablyBgColor,
  TLDokablySize,
  TLDokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';
import { TLBaseShape } from '@tldraw/editor';

export type IMindMapMainInput = TLBaseShape<
  MIND_MAP_MAIN_INPUT_SHAPE_ID_TYPE,
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
    maxYWithChildren: number;
    maxXWithChildren: number;
    heightWithChildren: number;
    widthWithChildren: number;
    arrowId: string;
    border: TLDokablyMindMapBorder;
    textContents: string;
  }
>;
