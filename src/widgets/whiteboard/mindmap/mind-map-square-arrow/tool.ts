import { StateNode } from '@tldraw/tldraw';
import { Pointing } from './Pointing';
import { Idle } from './Idle';
import { MIND_MAP_SQUARE_ARROW_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class MindMapSquareArrowTool extends StateNode {
  static override id = MIND_MAP_SQUARE_ARROW_SHAPE_ID;
  static override initial = 'idle';

  static override children = () => [Idle, Pointing]
  override shapeType = MIND_MAP_SQUARE_ARROW_SHAPE_ID;
}
