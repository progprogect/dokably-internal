import { ShapeProps } from '@tldraw/editor';
import { T } from '@tldraw/validate';
import { ICustomEmoji } from './custom-emoji-types';

export const customEmojiProps: ShapeProps<ICustomEmoji> = {
  w: T.number,
  h: T.number,
  emoji: T.string,
  fontSize: T.number,
};
