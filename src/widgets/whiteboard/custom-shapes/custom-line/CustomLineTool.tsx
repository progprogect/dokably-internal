import { StateNode } from '@tldraw/tldraw';
import { Pointing } from './Pointing';
import { Idle } from './Idle';
import { CUSTOM_LINE_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomLineTool extends StateNode {
  static override id = CUSTOM_LINE_SHAPE_ID;
  static override initial = 'idle';

  static override children = () => [Idle, Pointing]
  override shapeType = CUSTOM_LINE_SHAPE_ID;
}
