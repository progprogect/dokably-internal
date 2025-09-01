import { ShapeProps } from '@tldraw/editor';
import { T } from '@tldraw/validate';
import { IMindMapChildInput } from './mind-map-child-input-types';
import {
  DocablyBorderColor,
  DokablyAlign,
  DokablyColor,
  DocablyBgColor,
  DokablySize,
  DokablyVerticalAlign,
  DocablyMindMapSide,
  DocablyMindMapBorderColor,
  DocablyMindMapBorder,
} from '@app/constants/whiteboard/whiteboard-styles';

export const mindMapChildInputProps: ShapeProps<IMindMapChildInput> = {
  w: T.number,
  h: T.number,
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
  index: T.number,
  heightWithChildren: T.number,
  widthWithChildren: T.number,
  maxYWithChildren: T.number,
  maxXWithChildren: T.number,
  arrowId: T.string,
  textContents: T.string,
  border: DocablyMindMapBorder,
};
