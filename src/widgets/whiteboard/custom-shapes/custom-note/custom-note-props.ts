import { ShapeProps, StyleProp } from '@tldraw/editor';
import { T } from '@tldraw/validate';
import { ICustomNote } from './custom-note-types';
import {
  DokablyAlign,
  DokablyColor,
  DokablyNoteBgColor,
  DokablySize,
  DokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';

export const customNoteProps: ShapeProps<ICustomNote> = {
  w: T.number,
  h: T.number,
  color: DokablyColor,
  fill: DokablyNoteBgColor,
  size: DokablySize,
  fontFamily: T.string,
  fontSize: T.number,
  text: T.string,
  align: DokablyAlign,
  verticalAlign: DokablyVerticalAlign,
  url: T.string,
  textContents: T.string,
};
