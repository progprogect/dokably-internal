import { BaseBoxShapeTool } from '@tldraw/editor';
import { EMOJI_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomEmojiTool extends BaseBoxShapeTool {
  static override id = EMOJI_SHAPE_ID;
  static override initial = 'idle';

  override shapeType = EMOJI_SHAPE_ID;
}
