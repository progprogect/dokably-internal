import { ShapeProps } from '@tldraw/editor';
import { T } from '@tldraw/validate';
import { ICustomRhombus } from './custom-rhombus-types';
import {
  DocablyBorderColor,
  DokablyAlign,
  DokablyColor,
  DocablyBgColor,
  DokablySize,
  DokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';

export const customRhombusProps: ShapeProps<ICustomRhombus> = {
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
