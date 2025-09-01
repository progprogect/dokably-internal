import { ContentBlock, EditorState, KeyBindingUtil } from 'draft-js';
import { EditorPlugin, PluginFunctions } from '@draft-js-plugins/editor';

import BlockType from '@entities/enums/BlockType';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import { KeyboardEvent } from 'react';
import { getEditorBase } from '@app/hooks/editor/getEditorBase';
import { getTextAfterCursor } from '@app/hooks/editor/getTextAfterCursor';
import { PluginBlockPropsToRender, PluginBlockToRender } from '../../types';
import { createEditorPluginStore } from '../../utils/createEditorPluginStore';
import { resetBlockOnNewLine } from '../../utils/resetBlockOnNewLine';

interface IUnderlinePluginStore {
  setEditorState?(editorState: EditorState): void;
  getEditorState?(): EditorState;
}

const UnderlinePlugin = (
  BlockToRender: PluginBlockToRender<PluginBlockPropsToRender>,
): EditorPlugin => {
  const { toggleBlockType } = useBlockTypes();
  const store = createEditorPluginStore<IUnderlinePluginStore>({
    getEditorState: undefined,
    setEditorState: undefined,
  });

  return {
    blockRendererFn: (contentBlock: ContentBlock) => {
      if (contentBlock.getType() === BlockType.Underline) {
        return { component: BlockToRender, props: { store } };
      }
      return null;
    },
    initialize: ({ getEditorState, setEditorState }) => {
      store.updateItem('getEditorState', getEditorState);
      store.updateItem('setEditorState', setEditorState);
    },
    handleReturn: (
      event: KeyboardEvent,
      editorState: EditorState,
      pluginFunctions: PluginFunctions,
    ) => {
      const base = getEditorBase(editorState);
      const textAfterCursor = getTextAfterCursor(base);
      const isSoftReturn = KeyBindingUtil.isSoftNewlineEvent(event);

      if (
        base.block.getType() === BlockType.Underline ||
        editorState.getCurrentInlineStyle().has('UNDERLINE')
      ) {
        if (!isSoftReturn && textAfterCursor.length === 0) {
          pluginFunctions.setEditorState(resetBlockOnNewLine(editorState));
          return 'handled';
        }
      }

      return 'not-handled';
    },
    onChange: (editorState: EditorState) => {
      const base = getEditorBase(editorState);

      if (
        base.block.getType() === BlockType.Underline &&
        base.block.getText().length === 0
      ) {
        return toggleBlockType(editorState, BlockType.Text);
      }

      return editorState;
    },
  };
};

export default UnderlinePlugin;
