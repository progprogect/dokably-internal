import { BaseBoxShapeTool } from '@tldraw/editor';
import { CUSTOM_PARALLELOGRAM_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomParallelogramTool extends BaseBoxShapeTool {
  static override id = CUSTOM_PARALLELOGRAM_SHAPE_ID;
  static override initial = 'idle';

  override shapeType = CUSTOM_PARALLELOGRAM_SHAPE_ID;
}
