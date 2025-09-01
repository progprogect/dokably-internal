import { ContentBlock, EditorState } from 'draft-js';
import { EditorPlugin, PluginFunctions } from '@draft-js-plugins/editor';

import BlockType from '@entities/enums/BlockType';
import { KeyboardEvent } from 'react';
import {
  PluginBlockPropsToRender,
  PluginBlockToRender,
  PluginStore,
} from '../../types';
import { createEditorPluginStore } from '../../utils/createEditorPluginStore';

const blockType = BlockType.BulletList;

const BulletedListPlugin = (
  BlockToRender: PluginBlockToRender<PluginBlockPropsToRender>,
): EditorPlugin => {
  const store = createEditorPluginStore<PluginStore>({
    getEditorState: undefined,
    setEditorState: undefined,
  });
  return {
    blockRendererFn: (
      contentBlock: ContentBlock,
      pluginFunctions: PluginFunctions,
    ) => {
      if (contentBlock.getType() === blockType) {
        return {
          component: BlockToRender,
          props: {
            store,
            editorState: pluginFunctions.getEditorState(),
            setEditorState: (editorState: EditorState) =>
              pluginFunctions.setEditorState(editorState),
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
      if (type === blockType) {
        return 'dokably-bulleted-list-block';
      }
    },
    keyBindingFn: (event: KeyboardEvent, pluginFunctions: PluginFunctions) => {
      const editorState = pluginFunctions.getEditorState();
      let selectionState = editorState.getSelection();
      let anchorKey = selectionState.getAnchorKey();
      let currentContent = editorState.getCurrentContent();
      let contentBlock = currentContent.getBlockForKey(anchorKey);
      if (contentBlock && contentBlock.getType() === blockType) {
        // if (
        //   event.key === 'Backspace' &&
        //   !event.shiftKey &&
        //   !event.altKey &&
        //   !event.ctrlKey
        // ) {
        //   if (selectionState.isCollapsed()) {
        //     if (selectionState.getAnchorOffset() === 0) {
        //       return 'reset_type_command';
        //     }
        //   }
        // }
        if (
          event.key === 'Enter' &&
          !event.shiftKey &&
          !event.altKey &&
          !event.ctrlKey
        ) {
          if (contentBlock.getText().length === 0) {
            return 'reset_type_command';
          }
        }
        if (
          event.key === 'Tab' &&
          !event.shiftKey &&
          !event.altKey &&
          !event.ctrlKey
        ) {
          const blockIndex = currentContent
            .getBlocksAsArray()
            .findIndex(
              (el: ContentBlock) => el.getKey() === contentBlock.getKey(),
            );
          const prevBlock = currentContent.getBlocksAsArray()[blockIndex - 1];
          const isTabEventDisable =
            !prevBlock ||
            prevBlock.getType() === BlockType.Title ||
            prevBlock.getDepth() + 1 === contentBlock.getDepth();
          if (!isTabEventDisable) {
            return 'tab_command';
          } else {
            return 'tab_command_disabled';
          }
        }
      }
    },
  };
};

export default BulletedListPlugin;
