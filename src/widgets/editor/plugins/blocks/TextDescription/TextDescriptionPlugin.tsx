import {
  ContentBlock,
  EditorCommand,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';
import { EditorPlugin, PluginFunctions } from '@draft-js-plugins/editor';

import BlockType from '@entities/enums/BlockType';
import { KeyboardEvent } from 'react';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import {
  PluginBlockPropsToRender,
  PluginBlockToRender,
  PluginStore,
} from '../../types';
import { createEditorPluginStore } from '../../utils/createEditorPluginStore';

const TextDescriptionPlugin = (
  BlockToRender: PluginBlockToRender<PluginBlockPropsToRender>,
): EditorPlugin => {
  const { toggleBlockType } = useBlockTypes();
  const store = createEditorPluginStore<PluginStore>({
    getEditorState: undefined,
    setEditorState: undefined,
  });
  return {
    onChange: (editorState: EditorState) => {
      let savedSelectedState = editorState.getSelection();
      const currentContent = editorState.getCurrentContent();
      const firstBlock = currentContent.getBlockMap().first();
      const isHeading = firstBlock.getType() === BlockType.Title;

      if (!isHeading) {
        const selection = SelectionState.createEmpty(firstBlock.getKey());
        const newContent = Modifier.setBlockType(
          editorState.getCurrentContent(),
          selection,
          BlockType.Title,
        );

        editorState = EditorState.push(
          editorState,
          newContent,
          'change-block-type',
        );

        editorState = EditorState.forceSelection(
          editorState,
          savedSelectedState,
        );
      }
      return editorState;
    },
    blockRendererFn: (contentBlock: ContentBlock) => {
      if (contentBlock.getType() === BlockType.Title) {
        return {
          component: BlockToRender,
          editable: true,
          props: { store },
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
      if (type === BlockType.Title) {
        return 'dokably-text-description-block';
      }
    },
    keyBindingFn: (event: KeyboardEvent, pluginFunctions: PluginFunctions) => {
      const editorState = pluginFunctions.getEditorState();
      let selectionState = editorState.getSelection();
      let anchorKey = selectionState.getAnchorKey();
      let currentContent = editorState.getCurrentContent();
      let contentBlock = currentContent.getBlockForKey(anchorKey);
      if (contentBlock && contentBlock.getType() === BlockType.Title) {
        if (
          event.key === 'Enter' &&
          !event.shiftKey &&
          !event.altKey &&
          !event.ctrlKey
        ) {
          return 'insert_block_after_title';
        }

        if (event.key === 'Tab') {
          return 'tab_command_disabled';
        }
      }
    },
    handleKeyCommand: (
      command: EditorCommand,
      editorState: EditorState,
      eventTimeStamp: number,
      pluginFunctions: PluginFunctions,
    ) => {
      if (command === 'insert_block_after_title') {
        const selection = editorState.getSelection();
        const nextContentState = Modifier.splitBlock(
          editorState.getCurrentContent(),
          selection,
        );

        editorState = EditorState.push(
          editorState,
          nextContentState,
          'split-block',
        );
        const newBlock = editorState.getCurrentContent().getBlocksAsArray()[1];

        editorState = toggleBlockType(editorState, BlockType.Text, newBlock);

        pluginFunctions.setEditorState(editorState);

        return 'handled';
      }
      return 'not-handled';
    },
  };
};

export default TextDescriptionPlugin;
