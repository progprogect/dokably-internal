import { StateNode } from '@tldraw/tldraw';
import { Pointing } from './Pointing';
import { Idle } from './Idle';
import { CUSTOM_SOFT_ARROW_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomSoftArrowTool extends StateNode {
  static override id = CUSTOM_SOFT_ARROW_SHAPE_ID;
  static override initial = 'idle';

  static override children = () => [Idle, Pointing]
  override shapeType = CUSTOM_SOFT_ARROW_SHAPE_ID;
}
