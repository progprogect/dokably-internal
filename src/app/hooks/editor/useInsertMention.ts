import { EditorState, Modifier, SelectionState, ContentState, ContentBlock } from 'draft-js';
import useContentBlock from '@app/hooks/editor/useContentBlock';
import BlockType from '@entities/enums/BlockType';

const useInsertMention = (editorState: EditorState, setEditorState: (editorState: EditorState) => void) => {
  const { getCurrentContentBlock } = useContentBlock();

  const createSlashSelection = (contentBlock: ContentBlock, selectionState: SelectionState): SelectionState => {
    return selectionState.merge({
      focusKey: contentBlock.getKey(),
      anchorKey: contentBlock.getKey(),
      focusOffset: selectionState.getFocusOffset(),
      anchorOffset: selectionState.getFocusOffset() - 1,
    }) as SelectionState;
  };

  const removeSlash = (contentState: ContentState, slashSelection: SelectionState): ContentState => {
    return Modifier.removeRange(contentState, slashSelection, 'backward');
  };

  const insertTextWithSelection = (
    contentState: ContentState,
    selectionState: SelectionState,
    text: string,
    entityKey?: string,
  ): { newContentState: ContentState; finalSelection: SelectionState } => {
    const newContentState = Modifier.replaceText(contentState, selectionState, text, undefined, entityKey);

    const finalSelection = selectionState.merge({
      focusOffset: selectionState.getAnchorOffset() + text.length,
      anchorOffset: selectionState.getAnchorOffset() + text.length,
    }) as SelectionState;

    return { newContentState, finalSelection };
  };

  const updateEditorState = (newContentState: ContentState, finalSelection: SelectionState): void => {
    let newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');

    newEditorState = EditorState.forceSelection(newEditorState, finalSelection);

    setEditorState(newEditorState);
  };

  const insertMentionBlock = (mention: { type: BlockType; text: string; url?: string }): void => {
    const contentBlock = getCurrentContentBlock(editorState);
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const slashSelection = createSlashSelection(contentBlock, selectionState);

    let newContentState = contentState.createEntity(mention.type, 'IMMUTABLE', mention.url ? { url: mention.url } : {});

    const entityKey = newContentState.getLastCreatedEntityKey();
    newContentState = removeSlash(newContentState, slashSelection);

    const mentionText = `${mention.text}\u200B`;
    const { newContentState: contentStateWithMention, finalSelection } = insertTextWithSelection(
      newContentState,
      slashSelection.merge({
        anchorOffset: slashSelection.getAnchorOffset(),
        focusOffset: slashSelection.getAnchorOffset(),
      }) as SelectionState,
      mentionText,
      entityKey,
    );

    const { newContentState: finalContentState, finalSelection: finalSelectionWithSpace } = insertTextWithSelection(
      contentStateWithMention,
      finalSelection,
      ' ',
    );

    updateEditorState(finalContentState, finalSelectionWithSpace);
  };

  const insertText = (text: string): void => {
    const contentBlock = getCurrentContentBlock(editorState);
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const slashSelection = createSlashSelection(contentBlock, selectionState);
    const contentStateWithoutSlash = removeSlash(contentState, slashSelection);

    const collapsedSelection = slashSelection.merge({
      focusOffset: slashSelection.getAnchorOffset(),
      anchorOffset: slashSelection.getAnchorOffset(),
    }) as SelectionState;

    const { newContentState, finalSelection } = insertTextWithSelection(
      contentStateWithoutSlash,
      collapsedSelection,
      text,
    );

    updateEditorState(newContentState, finalSelection);
  };

  return { insertMentionBlock, insertText };
};

export default useInsertMention;
