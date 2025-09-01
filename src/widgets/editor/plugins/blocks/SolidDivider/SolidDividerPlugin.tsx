import { ContentBlock, EditorCommand, EditorState, Modifier } from 'draft-js';
import { EditorPlugin, PluginFunctions } from '@draft-js-plugins/editor';

import BlockType from '@entities/enums/BlockType';
import { KeyboardEvent } from 'react';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import useBlockData from '@app/hooks/editor/useBlockData';
import {
  PluginBlockPropsToRender,
  PluginBlockToRender,
  PluginStore,
} from '../../types';
import { createEditorPluginStore } from '../../utils/createEditorPluginStore';

const SolidDividerPlugin = (
  BlockToRender: PluginBlockToRender<PluginBlockPropsToRender>,
): EditorPlugin => {
  const { toggleBlockType } = useBlockTypes();
  const { setBlockDepth } = useBlockData();

  const store = createEditorPluginStore<PluginStore>({
    getEditorState: undefined,
    setEditorState: undefined,
  });

  return {
    blockRendererFn: (
      contentBlock: ContentBlock,
      pluginFunctions: PluginFunctions,
    ) => {
      if (contentBlock.getType() === BlockType.SolidDivider) {
        return {
          component: BlockToRender,
          editable: true,
          props: {
            editorState: pluginFunctions.getEditorState(),
            setEditorState: (editorState: EditorState) =>
              pluginFunctions.setEditorState(editorState),
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
      if (contentBlock.getType() === BlockType.SolidDivider) {
        return 'dokably-solid-divider-block';
      }
    },
    keyBindingFn: (event: KeyboardEvent, pluginFunctions: PluginFunctions) => {
      const editorState = pluginFunctions.getEditorState();
      let selectionState = editorState.getSelection();
      let anchorKey = selectionState.getAnchorKey();
      let currentContent = editorState.getCurrentContent();
      let contentBlock = currentContent.getBlockForKey(anchorKey);
      if (contentBlock.getType() === BlockType.SolidDivider) {
        if (
          event.key === 'Backspace' &&
          !event.shiftKey &&
          !event.altKey &&
          !event.ctrlKey
        ) {
          if (selectionState.isCollapsed()) {
            if (selectionState.getAnchorOffset() === 0) {
              return 'reset_type_command';
            }
          }
        }
        if (
          event.key === 'Enter' &&
          !event.shiftKey &&
          !event.altKey &&
          !event.ctrlKey
        ) {
          if (contentBlock.getText().length === 0) {
            return 'reset_type_command';
          } else {
            return 'insert_block_after_heading';
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
    handleKeyCommand: (
      command: EditorCommand,
      editorState: EditorState,
      eventTimeStamp: number,
      pluginFunctions: PluginFunctions,
    ) => {
      if (command === 'insert_block_after_heading') {
        let editorState = pluginFunctions.getEditorState();
        let selectionState = editorState.getSelection();
        let anchorKey = selectionState.getAnchorKey();
        let currentContent = editorState.getCurrentContent();
        let contentBlock = currentContent.getBlockForKey(anchorKey);
        const blockIndex = currentContent
          .getBlocksAsArray()
          .findIndex(
            (el: ContentBlock) => el.getKey() === contentBlock.getKey(),
          );
        const nextContentState = Modifier.splitBlock(
          editorState.getCurrentContent(),
          selectionState,
        );

        editorState = EditorState.push(
          editorState,
          nextContentState,
          'split-block',
        );

        const newBlock = editorState.getCurrentContent().getBlocksAsArray()[
          blockIndex + 1
        ];
        const depth = newBlock.getDepth();
        editorState = toggleBlockType(editorState, BlockType.Text, newBlock);
        editorState = setBlockDepth(editorState, newBlock.getKey(), depth);
        pluginFunctions.setEditorState(editorState);
        return 'handled';
      }
      return 'not-handled';
    },
  };
};

export default SolidDividerPlugin;
