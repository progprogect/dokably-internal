import { CUSTOM_SEXAGON_SHAPE_ID_TYPE } from '@app/constants/whiteboard/shape-ids';
import {
  TLDokablyAlign,
  TLDokablyBorderColor,
  TLDokablyBgColor,
  TLDokablySize,
  TLDokablyVerticalAlign,
  TLDokablyTextColor,
} from '@app/constants/whiteboard/whiteboard-styles';
import { TLBaseShape } from '@tldraw/editor';

export type ICustomSexagon = TLBaseShape<
  CUSTOM_SEXAGON_SHAPE_ID_TYPE,
  {
    w: number;
    h: number;
    color: TLDokablyTextColor;
    fill: TLDokablyBgColor;
    borderColor: TLDokablyBorderColor;
    size: TLDokablySize;
    fontFamily: string;
    fontSize: number;
    text: string;
    align: TLDokablyAlign;
    verticalAlign: TLDokablyVerticalAlign;
    url: string;
    textContents: string,
  }
>;
