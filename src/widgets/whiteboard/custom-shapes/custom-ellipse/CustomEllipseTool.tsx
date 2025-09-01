import { BaseBoxShapeTool } from '@tldraw/editor';
import { CUSTOM_ELLIPSE_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomEllipseTool extends BaseBoxShapeTool {
  static override id = CUSTOM_ELLIPSE_SHAPE_ID;
  static override initial = 'idle';

  override shapeType = CUSTOM_ELLIPSE_SHAPE_ID;
}
