import { vecModelValidator } from '@tldraw/editor';
import { T } from '@tldraw/validate';
import { DokablyColor, DokablyPenSize } from '@app/constants/whiteboard/whiteboard-styles';

export const DrawShapeSegment = T.object({
  //@ts-ignore
  type: T.literalEnum('free', 'straight'),
  points: T.arrayOf(vecModelValidator),
});

export type TLDrawShapeSegment = T.TypeOf<typeof DrawShapeSegment>;

export const customPenProps = {
  color: DokablyColor,
  size: DokablyPenSize,
  segments: T.arrayOf(DrawShapeSegment),
  isComplete: T.boolean,
  isClosed: T.boolean,
  isPen: T.boolean,
};
