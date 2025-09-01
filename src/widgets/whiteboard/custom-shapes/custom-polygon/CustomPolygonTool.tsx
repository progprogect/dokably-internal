import { BaseBoxShapeTool } from '@tldraw/editor';
import { CUSTOM_POLYGON_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomPolygonTool extends BaseBoxShapeTool {
  static override id = CUSTOM_POLYGON_SHAPE_ID;
  static override initial = 'idle';

  override shapeType = CUSTOM_POLYGON_SHAPE_ID;
}
