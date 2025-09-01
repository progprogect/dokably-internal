import { ShapeProps } from '@tldraw/editor';
import { T } from '@tldraw/validate';
import { ICustomRectangle } from './custom-rectangle-types';
import {
  DocablyBorderColor,
  DokablyAlign,
  DokablyTextColor,
  DocablyBgColor,
  DokablySize,
  DokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';

export const customRectangleProps: ShapeProps<ICustomRectangle> = {
  w: T.number,
  h: T.number,
  color: DokablyTextColor,
  borderColor: DocablyBorderColor,
  fill: DocablyBgColor,
  size: DokablySize,
  fontFamily: T.string,
  fontSize: T.number,
  text: T.string,
  align: DokablyAlign,
  verticalAlign: DokablyVerticalAlign,
  url: T.string,
  textContents: T.string,
};
