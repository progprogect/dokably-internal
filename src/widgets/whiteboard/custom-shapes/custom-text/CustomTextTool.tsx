import { BaseBoxShapeTool } from '@tldraw/editor';
import { CUSTOM_TEXT_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomTextTool extends BaseBoxShapeTool {
  static override id = CUSTOM_TEXT_SHAPE_ID;
  static override initial = 'idle';

  override shapeType = CUSTOM_TEXT_SHAPE_ID;
}
