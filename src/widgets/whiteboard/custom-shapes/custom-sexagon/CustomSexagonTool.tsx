import { CUSTOM_SEXAGON_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { BaseBoxShapeTool } from '@tldraw/editor';

export class CustomSexagonTool extends BaseBoxShapeTool {
  static override id = CUSTOM_SEXAGON_SHAPE_ID;
  static override initial = 'idle';

  override shapeType = CUSTOM_SEXAGON_SHAPE_ID;
}
