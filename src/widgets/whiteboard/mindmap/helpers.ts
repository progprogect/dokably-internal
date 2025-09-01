import {
  MIND_MAP_CHILD_INPUT_SHAPE_ID,
  MIND_MAP_MAIN_INPUT_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import { TLShape } from '@tldraw/editor';

export const isThereAnyMindMapInput = (shapes: TLShape[]) => {
  if (!shapes) return false;

  if (shapes.length === 0) return false;
  if (!Array.isArray(shapes)) return false;

  const mindMapInputIds = [
    MIND_MAP_MAIN_INPUT_SHAPE_ID,
    MIND_MAP_CHILD_INPUT_SHAPE_ID,
  ] as string[];

  const isThereMindMapInput = shapes.some((item) =>
    mindMapInputIds.includes(item.type)
  );

  return isThereMindMapInput;
};
