import { EMOJI_SHAPE_ID_TYPE } from '@app/constants/whiteboard/shape-ids';
import { TLBaseShape } from '@tldraw/editor';

export type ICustomEmoji = TLBaseShape<
  EMOJI_SHAPE_ID_TYPE,
  {
    w: number;
    h: number;
    fontSize: number;
    emoji: string;
  }
>;
