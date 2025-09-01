import { StateNode } from '@tldraw/editor';
import { Idle } from '../toolStates/Idle';
import { Drawing } from '../toolStates/Drawing';
import { CUSTOM_HIGHLIGHT_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomHighlightTool extends StateNode {
  static override id = CUSTOM_HIGHLIGHT_SHAPE_ID;
  static override initial = 'idle';
  static override children = () => [Idle, Drawing];

  override shapeType = 'draw';

  override onExit = () => {
    const drawingState = this.children!['drawing'] as Drawing;
    drawingState.initialShape = undefined;
  };
}
