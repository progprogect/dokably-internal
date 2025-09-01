import { BaseBoxShapeTool } from '@tldraw/editor';
import { MIND_MAP_CHILD_INPUT_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class MindMapChildInputTool extends BaseBoxShapeTool {
  static override id = MIND_MAP_CHILD_INPUT_SHAPE_ID;
  static override initial = 'idle';

  override shapeType = MIND_MAP_CHILD_INPUT_SHAPE_ID;
}
