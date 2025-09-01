import { ContentState, EditorState, Modifier } from 'draft-js';
import { OrderedSet } from 'immutable';

export function inlineStylesOverride(
  editorState: EditorState,
  contentState: ContentState,
): EditorState {
  const updatedContentState = Modifier.insertText(
    contentState,
    editorState.getSelection(),
    ' ',
  );

  const withTemporaryText = EditorState.push(
    editorState,
    updatedContentState,
    'insert-characters',
  );

  const editorStateWithoutStyles = EditorState.setInlineStyleOverride(
    withTemporaryText,
    OrderedSet(),
  );

  return editorStateWithoutStyles;
}
