import { BaseBoxShapeTool } from '@tldraw/editor';
import { MIND_MAP_MAIN_INPUT_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class MindMapMainInputTool extends BaseBoxShapeTool {
  static override id = MIND_MAP_MAIN_INPUT_SHAPE_ID;
  static override initial = 'idle';

  override shapeType = MIND_MAP_MAIN_INPUT_SHAPE_ID;
}
