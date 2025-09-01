import { ContentBlock, EditorCommand, EditorState, RichUtils } from 'draft-js';
import { EditorPlugin, PluginFunctions } from '@draft-js-plugins/editor';
import { KeyboardEvent } from 'react';

import BlockType from '@entities/enums/BlockType';
import useBlockData from '@app/hooks/editor/useBlockData';
import { PluginBlockPropsToRender, PluginBlockToRender, PluginStore } from '../../types';
import { createEditorPluginStore } from '../../utils/createEditorPluginStore';

const createBannerPlugin = (BlockToRender: PluginBlockToRender<PluginBlockPropsToRender>): EditorPlugin => {
  // Rename function
  const store = createEditorPluginStore<PluginStore>({
    getEditorState: undefined,
    setEditorState: undefined,
  });
  const { setBlockDataValues } = useBlockData(); // Keep for potential future use

  return {
    blockRendererFn: (contentBlock: ContentBlock) => {
      if (contentBlock.getType() === BlockType.Banner) {
        return {
          component: BlockToRender,
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
      if (contentBlock.getType() === BlockType.Banner) {
        return 'dokably-banner-block'; // Use a specific class for banner
      }
    },
    // Basic key binding and command handling (can be expanded later)
    // Prevent default Enter behavior for Banner blocks
    handleReturn: (event: KeyboardEvent, editorState: EditorState, { setEditorState }: PluginFunctions) => {
      const selection = editorState.getSelection();
      const contentState = editorState.getCurrentContent();
      const blockKey = selection.getStartKey();
      const block = contentState.getBlockForKey(blockKey);

      if (block.getType() === BlockType.Banner) {
        // Insert soft newline instead of splitting block
        const newState = RichUtils.insertSoftNewline(editorState);
        setEditorState(newState);
        return 'handled';
      }
      return 'not-handled';
    },
    // keyBindingFn remains useful for other potential custom key bindings
    keyBindingFn: (event: KeyboardEvent, { getEditorState }: PluginFunctions) => {
      // Add any other banner-specific keybindings here if needed
      return undefined; // Default Draft.js behavior for other keys
    },
    // handleKeyCommand remains useful if keyBindingFn returns custom commands
    handleKeyCommand: (
      command: EditorCommand,
      editorState: EditorState,
      eventTimeStamp: number,
      { setEditorState }: PluginFunctions,
    ) => {
      // Handle custom commands if defined in keyBindingFn
      // if (command === 'your-custom-banner-command') {
      //   // Handle command
      //   return 'handled';
      // }
      return 'not-handled';
    },
  };
};

export default createBannerPlugin; // Update default export
