import { StateNode } from '@tldraw/editor';
import { Idle } from '../toolStates/Idle';
import { Drawing } from '../toolStates/Drawing';
import { CUSTOM_DRAW_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomPenTool extends StateNode {
  static override id = CUSTOM_DRAW_SHAPE_ID;
  static override initial = 'idle';
  static override children = () => [Idle, Drawing];

  override shapeType = CUSTOM_DRAW_SHAPE_ID;

  override onExit = () => {
    const drawingState = this.children!['drawing'] as Drawing;
    drawingState.initialShape = undefined;
  };
}
