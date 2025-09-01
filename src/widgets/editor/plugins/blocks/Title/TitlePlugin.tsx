import { ContentBlock, EditorCommand, EditorState, Modifier, SelectionState } from 'draft-js';
import { EditorPlugin, PluginFunctions } from '@draft-js-plugins/editor';
import BlockType from '@entities/enums/BlockType';
import { KeyboardEvent } from 'react';
import * as _ from 'lodash';
import { createEditorPluginStore } from '../../utils/createEditorPluginStore';
import { PluginBlockPropsToRender, PluginBlockToRender, PluginStore } from '../../types';

export const createTitlePlugin = (BlockToRender: PluginBlockToRender<PluginBlockPropsToRender>): EditorPlugin => {
  const store = createEditorPluginStore<PluginStore>({
    getEditorState: undefined,
    setEditorState: undefined,
  });

  const ensureTitleBlock = (editorState: EditorState): EditorState => {
    const currentContent = editorState.getCurrentContent();
    const firstBlock = currentContent.getBlockMap().first();
    const isHeading = firstBlock.getType() === BlockType.Title;
    const savedSelectedState = editorState.getSelection();

    if (!isHeading) {
      const selection = SelectionState.createEmpty(firstBlock.getKey());
      const newContent = Modifier.setBlockType(currentContent, selection, BlockType.Title);

      const newEditorState = EditorState.push(editorState, newContent, 'change-block-type');

      return EditorState.forceSelection(newEditorState, savedSelectedState);
    }

    return editorState;
  };

  const toggleBlockType = (editorState: EditorState, blockType: BlockType, block: ContentBlock): EditorState => {
    const blockKey = block.getKey();
    const selection = SelectionState.createEmpty(blockKey);

    const newContentState = Modifier.setBlockType(editorState.getCurrentContent(), selection, blockType);

    return EditorState.push(editorState, newContentState, 'change-block-type');
  };

  let titleInitialized = false;

  return {
    onChange: (editorState: EditorState) => {
      if (!titleInitialized) {
        titleInitialized = true;
        return ensureTitleBlock(editorState);
      }

      const currentContent = editorState.getCurrentContent();
      const firstBlock = currentContent.getBlockMap().first();
      if (firstBlock.getType() !== BlockType.Title) {
        return ensureTitleBlock(editorState);
      }

      return editorState;
    },

    blockRendererFn: (contentBlock: ContentBlock, pluginFunctions: PluginFunctions) => {
      if (contentBlock.getType() === BlockType.Title) {
        const setEditorState = (state: EditorState) => {
          pluginFunctions.setEditorState(state);
        };
        return {
          component: BlockToRender,
          props: { store, pluginFunctions, setEditorState },
        };
      }
      return null;
    },

    initialize: ({ getEditorState, setEditorState }) => {
      store.updateItem('getEditorState', getEditorState);
      store.updateItem('setEditorState', setEditorState);

      setTimeout(() => {
        const currentState = getEditorState();
        const newState = ensureTitleBlock(currentState);

        if (newState !== currentState) {
          setEditorState(newState);
          titleInitialized = true;
        }
      }, 0);
    },

    blockStyleFn: (contentBlock: ContentBlock) => {
      const type = contentBlock.getType();
      if (type === BlockType.Title) {
        return 'dokably-title-block';
      }
    },

    keyBindingFn: (event: KeyboardEvent, pluginFunctions: PluginFunctions) => {
      const editorState = pluginFunctions.getEditorState();
      const selectionState = editorState.getSelection();
      const anchorKey = selectionState.getAnchorKey();
      const currentContent = editorState.getCurrentContent();
      const contentBlock = currentContent.getBlockForKey(anchorKey);
      if (contentBlock && contentBlock.getType() === BlockType.Title) {
        if (event.key === 'Enter' && !event.shiftKey && !event.altKey && !event.ctrlKey) {
          return 'insert_block_after_title';
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
        const nextContentState = Modifier.splitBlock(editorState.getCurrentContent(), selection);

        let newState = EditorState.push(editorState, nextContentState, 'split-block');
        const newBlock = newState.getCurrentContent().getBlocksAsArray()[1];

        newState = toggleBlockType(newState, BlockType.Text, newBlock);
        newState = EditorState.forceSelection(
          newState,
          selection.merge({
            anchorKey: newBlock.getKey(),
            focusKey: newBlock.getKey(),
            anchorOffset: 0,
            focusOffset: 0,
          }),
        );

        pluginFunctions.setEditorState(newState);

        return 'handled';
      }
      return 'not-handled';
    },
  };
};
