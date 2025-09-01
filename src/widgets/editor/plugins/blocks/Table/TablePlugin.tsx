import { EditorPlugin, PluginFunctions } from '@draft-js-plugins/editor';
import BlockType from '@entities/enums/BlockType';
import { ContentBlock, EditorCommand, EditorState, Modifier } from 'draft-js';

import { PluginBlockPropsToRender, PluginBlockToRender, PluginStore } from '../../types';
import { createEditorPluginStore } from '../../utils/createEditorPluginStore';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import { KeyboardEvent } from 'react';

const BLOCK_TYPE = BlockType.Table;

export const TablePlugin = (BlockToRender: PluginBlockToRender<PluginBlockPropsToRender>): EditorPlugin => {
  const store = createEditorPluginStore<PluginStore>({
    getEditorState: undefined,
    setEditorState: undefined,
  });

  const { toggleBlockType } = useBlockTypes();

  return {
    initialize: ({ getEditorState, setEditorState }) => {
      store.updateItem('getEditorState', getEditorState);
      store.updateItem('setEditorState', setEditorState);
    },

    blockRendererFn: (contentBlock: ContentBlock) => {
      if (contentBlock.getType() === BLOCK_TYPE) {
        return {
          component: BlockToRender,
          editable: false,
          props: {
            store,
          },
        };
      }
      return null;
    },
    blockStyleFn: (contentBlock: ContentBlock) => {
      if (contentBlock.getType() === BLOCK_TYPE) {
        return 'dokably-dash-table-block';
      }
    },
    keyBindingFn: (event: KeyboardEvent, pluginFunctions: PluginFunctions) => {
      const editorState = pluginFunctions.getEditorState();
      let selectionState = editorState.getSelection();
      let anchorKey = selectionState.getAnchorKey();
      let currentContent = editorState.getCurrentContent();
      let contentBlock = currentContent.getBlockForKey(anchorKey);
      if (contentBlock && contentBlock.getType() === BLOCK_TYPE) {
        if (event.key === 'Enter' && !event.shiftKey && !event.altKey && !event.ctrlKey) {
          return 'insert_block_after_table' as string;
        }
      }
    },
    handleKeyCommand: (
      command: EditorCommand,
      editorState: EditorState,
      _: number,
      pluginFunctions: PluginFunctions,
    ) => {
      if (command === 'insert_block_after_table') {
        const selection = editorState.getSelection();
        const nextContentState = Modifier.splitBlock(editorState.getCurrentContent(), selection);

        editorState = EditorState.push(editorState, nextContentState, 'split-block');
        const newBlock = editorState.getCurrentContent().getBlocksAsArray()[1];

        editorState = toggleBlockType(editorState, BlockType.Text, newBlock);

        pluginFunctions.setEditorState(editorState);

        return 'handled';
      }
      return 'not-handled';
    },
  };
};
