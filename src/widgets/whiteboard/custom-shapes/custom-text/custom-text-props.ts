import { ShapeProps } from '@tldraw/editor';
import { T } from '@tldraw/validate';
import { ICustomText } from './custom-text-types';
import {
  DokablyTextShapeAlign,
  DokablyColor,
  DokablyFill,
  DokablySize,
  DokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';

export const customTextProps: ShapeProps<ICustomText> = {
  w: T.number,
  h: T.number,
  color: DokablyColor,
  fill: DokablyFill,
  size: DokablySize,
  fontFamily: T.string,
  fontSize: T.number,
  text: T.string,
  align: DokablyTextShapeAlign,
  verticalAlign: DokablyVerticalAlign,
  url: T.string,
  textContents: T.string,
  autoSize: T.boolean
};
