import { CUSTOM_NOTE_SHAPE_ID_TYPE } from '@app/constants/whiteboard/shape-ids';
import {
  TLDokablyAlign,
  TLDokablyNoteBgColor,
  TLDokablySize,
  TLDokablyTextColor,
  TLDokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';
import { TLBaseShape } from '@tldraw/editor';

export type ICustomNote = TLBaseShape<
  CUSTOM_NOTE_SHAPE_ID_TYPE,
  {
    w: number;
    h: number;
    color: TLDokablyTextColor;
    fill: TLDokablyNoteBgColor;
    size: TLDokablySize;
    fontFamily: string;
    fontSize: number;
    text: string;
    align: TLDokablyAlign;
    verticalAlign: TLDokablyVerticalAlign;
    url: string;
    textContents: string;
  }
>;
