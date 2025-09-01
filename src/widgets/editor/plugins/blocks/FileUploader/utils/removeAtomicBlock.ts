import { ContentBlock, ContentState, EditorState } from 'draft-js';

export function removeAtomicBlock(
  editorState: EditorState,
  contentState: ContentState,
  block: ContentBlock,
) {
  const blockMap = contentState.getBlockMap().delete(block.getKey());

  return EditorState.push(
    editorState,
    ContentState.createFromBlockArray(
      blockMap.toArray(),
      contentState.getEntityMap(),
    ),
    'remove-range',
  );
}
