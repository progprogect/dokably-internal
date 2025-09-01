import { ContentBlock, EditorCommand, EditorState } from 'draft-js';
import { EditorPlugin, PluginFunctions } from '@draft-js-plugins/editor';

import BlockType from '@entities/enums/BlockType';
import { EMBEDS_BLOCK_TYPES } from '@app/constants/embeds';
import { KeyboardEvent } from 'react';
import useBlockData from '@app/hooks/editor/useBlockData';
import { selectBlockBefore } from '@app/services/document.service';
import {
  PluginBlockPropsToRender,
  PluginBlockToRender,
  PluginStore,
} from '../../types';
import { createEditorPluginStore } from '../../utils/createEditorPluginStore';

const EmbedPlugin = (
  BlockToRender: PluginBlockToRender<PluginBlockPropsToRender>,
): EditorPlugin => {
  const store = createEditorPluginStore<PluginStore>({
    getEditorState: undefined,
    setEditorState: undefined,
  });
  const { setBlockDataValues } = useBlockData();
  return {
    blockRendererFn: (contentBlock: ContentBlock) => {
      if (EMBEDS_BLOCK_TYPES.includes(contentBlock.getType() as BlockType)) {
        return {
          component: BlockToRender,
          // editable: contentBlock.getData().get('isDisable') != true,
          props: {
            store,
          },
        };
      }
      return null;
    },
    initialize: ({ getEditorState, setEditorState }) => {
      store.updateItem('getEditorState', getEditorState);
      store.updateItem('setEditorState', setEditorState);
    },
    blockStyleFn: (contentBlock: ContentBlock) => {
      const type = contentBlock.getType();
      if (EMBEDS_BLOCK_TYPES.includes(type as BlockType)) {
        return 'dokably-embed-block';
      }
    },
    keyBindingFn: (event: KeyboardEvent, pluginFunctions: PluginFunctions) => {
      const editorState = pluginFunctions.getEditorState();
      const selectionState = editorState.getSelection();
      const anchorKey = selectionState.getAnchorKey();
      const currentContent = editorState.getCurrentContent();
      const contentBlock = currentContent.getBlockForKey(anchorKey);
      if (EMBEDS_BLOCK_TYPES.includes(contentBlock.getType() as BlockType)) {
        if (event.key === 'Backspace' && !event.shiftKey && !event.altKey) {
          if (selectionState.isCollapsed()) {
            if (selectionState.getAnchorOffset() === 0) {
              return 'nothing';
            }
          }
        }
        if (event.key === 'Enter') {
          return 'activate_embed_block';
        }
      }
    },
    handleKeyCommand: (
      command: EditorCommand,
      editorState: EditorState,
      eventTimeStamp: number,
      pluginFunctions: PluginFunctions,
    ) => {
      if (command === 'activate_embed_block') {
        const editorState = pluginFunctions.getEditorState();
        const selectionState = editorState.getSelection();
        const anchorKey = selectionState.getAnchorKey();
        const currentContent = editorState.getCurrentContent();
        const contentBlock = currentContent.getBlockForKey(anchorKey);
        if (contentBlock.getText().length > 0) {
          let newEditorState = setBlockDataValues(editorState, contentBlock, [
            { key: 'state', value: true },
            { key: 'isDisable', value: true },
          ]);
          newEditorState = selectBlockBefore(
            newEditorState,
            contentBlock.getKey(),
          );
          pluginFunctions.setEditorState(newEditorState);
        }
        return 'handled';
      }
      return 'not-handled';
    },
  };
};

export default EmbedPlugin;
