import { ContentState, EditorState } from 'draft-js';

export function setEntityData<D extends object>(
  editorState: EditorState,
  entityKey: string,
  data: D,
): EditorState {
  const currentContentState = editorState.getCurrentContent();
  // ! We create a new instance of ContentState because method `mergeEntityData` mutate entity data.
  const newContentState = ContentState.createFromBlockArray(
    currentContentState.getBlocksAsArray(),
    currentContentState.getEntityMap(),
  ).mergeEntityData(entityKey, data);

  return EditorState.push(editorState, newContentState, 'apply-entity');
}
