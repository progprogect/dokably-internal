import { AtomicBlockUtils, EditorState } from 'draft-js';

export function createAtomicBlock<M extends object>(
  type: string,
  editorState: EditorState,
  metadata?: M,
): EditorState {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(type, 'IMMUTABLE', {
    metadata,
  });

  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}
