import { BaseBoxShapeTool } from '@tldraw/editor';
import { CUSTOM_NOTE_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomNoteTool extends BaseBoxShapeTool {
  static override id = CUSTOM_NOTE_SHAPE_ID;
  static override initial = 'idle';

  override shapeType = CUSTOM_NOTE_SHAPE_ID;
}
