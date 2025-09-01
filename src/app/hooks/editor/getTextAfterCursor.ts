import { ContentBlock, SelectionState } from 'draft-js';

export const getTextAfterCursor = ({
  block,
  selection,
}: {
  block: ContentBlock;
  selection: SelectionState;
}) => {
  const blockText = block.getText();
  const cursorPosition = selection.getStartOffset();
  return blockText.slice(cursorPosition).trim();
};
