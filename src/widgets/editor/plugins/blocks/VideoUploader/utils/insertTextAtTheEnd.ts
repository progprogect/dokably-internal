import { ContentBlock, ContentState, EditorState, Modifier } from 'draft-js';

export function insertTextAtTheEnd(
  editorState: EditorState,
  block: ContentBlock,
  text: string,
): ContentState {
  const contentState = editorState.getCurrentContent();
  const blockKey = block.getKey();
  const blockLength = block.getLength();
  const selectionState = editorState.getSelection().merge({
    anchorKey: blockKey,
    anchorOffset: blockLength,
    focusKey: blockKey,
    focusOffset: blockLength,
  });

  return Modifier.insertText(contentState, selectionState, text);
}
