import { ShapeProps } from '@tldraw/editor';
import { T } from '@tldraw/validate';
import { ICustomParallelogram } from './custom-parallelogram-types';
import {
  DocablyBorderColor,
  DokablyAlign,
  DokablyColor,
  DocablyBgColor,
  DokablySize,
  DokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';

export const customParallelogramProps: ShapeProps<ICustomParallelogram> = {
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
