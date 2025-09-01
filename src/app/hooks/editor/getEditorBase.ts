import { EditorState } from 'draft-js';

export function getEditorBase(editorState: EditorState) {
  const selection = editorState.getSelection();
  const content = editorState.getCurrentContent();
  const anchorKey = selection.getAnchorKey();
  const block = content.getBlockForKey(anchorKey);
  return { selection, block, content, anchorKey };
}
