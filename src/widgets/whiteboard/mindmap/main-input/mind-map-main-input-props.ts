import { ShapeProps } from '@tldraw/editor';
import { T } from '@tldraw/validate';
import { IMindMapMainInput } from './mind-map-main-input-types';
import {
  DocablyMindMapBorderColor,
  DokablyAlign,
  DokablyColor,
  DocablyBgColor,
  DokablySize,
  DokablyVerticalAlign,
  DocablyMindMapSide,
  DocablyMindMapBorder,
} from '@app/constants/whiteboard/whiteboard-styles';

export const mindMapMainInputProps: ShapeProps<IMindMapMainInput> = {
  w: T.number,
  h: T.number,
  heightWithChildren: T.number,
  widthWithChildren: T.number,
  color: DokablyColor,
  borderColor: DocablyMindMapBorderColor,
  fill: DocablyBgColor,
  size: DokablySize,
  fontFamily: T.string,
  fontSize: T.number,
  text: T.string,
  align: DokablyAlign,
  verticalAlign: DokablyVerticalAlign,
  url: T.string,
  side: DocablyMindMapSide,
  maxYWithChildren: T.number,
  maxXWithChildren: T.number,
  arrowId: T.string,
  border: DocablyMindMapBorder,
  textContents: T.string,
};
