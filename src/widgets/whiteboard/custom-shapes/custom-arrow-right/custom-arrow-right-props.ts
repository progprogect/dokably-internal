import { ShapeProps } from '@tldraw/editor';
import { T } from '@tldraw/validate';
import { ICustomArrowRight } from './custom-arrow-right-types';
import {
  DocablyBgColor,
  DocablyBorderColor,
  DokablyAlign,
  DokablyColor,
  DokablySize,
  DokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';

export const customArrowRightProps: ShapeProps<ICustomArrowRight> = {
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
