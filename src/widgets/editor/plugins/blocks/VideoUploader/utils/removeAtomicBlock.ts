import { ContentBlock, ContentState, EditorState, Modifier, SelectionState } from 'draft-js';

export function removeAtomicBlock(
  editorState: EditorState,
  contentState: ContentState,
  block: ContentBlock,
): EditorState {
  const blockKey = block.getKey();
  const selection = SelectionState.createEmpty(blockKey);
  
  const newContentState = Modifier.removeRange(
    contentState,
    selection.merge({
      anchorOffset: 0,
      focusOffset: block.getLength(),
    }) as SelectionState,
    'backward'
  );

  return EditorState.push(editorState, newContentState, 'remove-range');
}
