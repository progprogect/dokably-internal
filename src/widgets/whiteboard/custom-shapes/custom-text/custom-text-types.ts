import { TLDokablyTextColor } from './../../../../app/constants/whiteboard/whiteboard-styles';
import { CUSTOM_TEXT_SHAPE_ID_TYPE } from '@app/constants/whiteboard/shape-ids';
import {
  TLDokablyTextShapeAlign,
  TLDokablyFill,
  TLDokablySize,
  TLDokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';
import { TLBaseShape } from '@tldraw/editor';

export type ICustomText = TLBaseShape<
  CUSTOM_TEXT_SHAPE_ID_TYPE,
  {
    w: number;
    h: number;
    color: TLDokablyTextColor;
    fill: TLDokablyFill;
    size: TLDokablySize;
    fontFamily: string;
    fontSize: number;
    text: string;
    align: TLDokablyTextShapeAlign;
    verticalAlign: TLDokablyVerticalAlign;
    url: string;
    textContents: string;
    autoSize: boolean
  }
>;
