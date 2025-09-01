import { EditorState, Modifier } from 'draft-js';
import { inlineStylesOverride } from './inlineStylesOverride';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import BlockType from '@entities/enums/BlockType';

export function resetBlockOnNewLine(editorState: EditorState): EditorState {
  const { toggleBlockType } = useBlockTypes();
  const editorStateInlineStylesOverride = inlineStylesOverride(
    editorState,
    editorState.getCurrentContent(),
  );

  const contentStateSplitBlock = Modifier.splitBlock(
    editorStateInlineStylesOverride.getCurrentContent(),
    editorStateInlineStylesOverride.getSelection(),
  );

  const editorStateToggleBlock = toggleBlockType(
    editorStateInlineStylesOverride,
    BlockType.Text,
  );

  return EditorState.push(
    editorStateToggleBlock,
    contentStateSplitBlock,
    'split-block',
  );
}
