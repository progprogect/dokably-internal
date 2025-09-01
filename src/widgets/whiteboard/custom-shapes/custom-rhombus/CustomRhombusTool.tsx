import { BaseBoxShapeTool } from '@tldraw/editor';
import { CUSTOM_RHOMBUS_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomRhombusTool extends BaseBoxShapeTool {
  static override id = CUSTOM_RHOMBUS_SHAPE_ID;
  static override initial = 'idle';

  override shapeType = CUSTOM_RHOMBUS_SHAPE_ID;
}
