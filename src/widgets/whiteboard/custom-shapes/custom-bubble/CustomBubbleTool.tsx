import { BaseBoxShapeTool } from '@tldraw/editor';
import { CUSTOM_BUBBLE_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomBubbleTool extends BaseBoxShapeTool {
  static override id = CUSTOM_BUBBLE_SHAPE_ID;
  static override initial = 'idle';

  override shapeType = CUSTOM_BUBBLE_SHAPE_ID;
}
