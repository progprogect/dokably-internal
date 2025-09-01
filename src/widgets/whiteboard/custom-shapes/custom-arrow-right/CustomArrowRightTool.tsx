import { BaseBoxShapeTool } from '@tldraw/editor';
import { CUSTOM_ARROW_RIGHT_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomArrowRightTool extends BaseBoxShapeTool {
  static override id = CUSTOM_ARROW_RIGHT_SHAPE_ID;
  static override initial = 'idle';

  override shapeType = CUSTOM_ARROW_RIGHT_SHAPE_ID;
}
