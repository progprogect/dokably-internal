import { ShapeProps } from '@tldraw/editor';
import { T } from '@tldraw/validate';
import { ICustomRectangleSoft } from './custom-rectangle-soft-types';
import {
  DocablyBorderColor,
  DokablyAlign,
  DokablyColor,
  DocablyBgColor,
  DokablySize,
  DokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';

export const customRectangleSoftProps: ShapeProps<ICustomRectangleSoft> = {
  w: T.number,
  h: T.number,
  color: DokablyColor,
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
