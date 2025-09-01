import { CUSTOM_ELLIPSE_SHAPE_ID_TYPE } from '@app/constants/whiteboard/shape-ids';
import {
  TLDokablyAlign,
  TLDokablyBgColor,
  TLDokablyBorderColor,
  TLDokablyColor,
  TLDokablySize,
  TLDokablyTextColor,
  TLDokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';
import { TLBaseShape } from '@tldraw/editor';

export type ICustomEllipse = TLBaseShape<
  CUSTOM_ELLIPSE_SHAPE_ID_TYPE,
  {
    w: number;
    h: number;
    color: TLDokablyTextColor;
    borderColor: TLDokablyBorderColor;
    fill: TLDokablyBgColor;
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
