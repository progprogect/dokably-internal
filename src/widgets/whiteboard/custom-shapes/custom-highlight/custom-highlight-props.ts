import { vecModelValidator } from '@tldraw/editor';
import { T } from '@tldraw/validate';
import { DokablyColor, DokablyHighlightSize } from '@app/constants/whiteboard/whiteboard-styles';

export const HighlightShapeSegment = T.object({
  //@ts-ignore
  type: T.literalEnum('free', 'straight'),
  points: T.arrayOf(vecModelValidator),
});

export type TLHighlightShapeSegment = T.TypeOf<typeof HighlightShapeSegment>;

export const customHighlightProps = {
  color: DokablyColor,
  size: DokablyHighlightSize,
  segments: T.arrayOf(HighlightShapeSegment),
  isComplete: T.boolean,
  isPen: T.boolean,
};
