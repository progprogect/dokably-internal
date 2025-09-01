import { ContentBlock, EditorCommand, EditorState, Modifier } from 'draft-js';
import { EditorPlugin, PluginFunctions } from '@draft-js-plugins/editor';

import { KeyboardEvent } from 'react';
import { getNestedBlocks } from '@app/services/block.service';
import useBlockData from '@app/hooks/editor/useBlockData';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import useEditorState from '@app/hooks/editor/useEditorState';
import BlockType from '@entities/enums/BlockType';
import { PluginBlockPropsToRender, PluginBlockToRender } from '../../types';
import { createEditorPluginStore } from '../../utils/createEditorPluginStore';

const blockType = BlockType.Toggle;

interface ITogglePluginStore {
  setEditorState?(editorState: EditorState): void;
  getEditorState?(): EditorState;
  getEditorRef?(): {
    refs?: { editor: HTMLElement };
    editor: HTMLElement;
  };
}

const ToggleListPlugin = (
  BlockToRender: PluginBlockToRender<PluginBlockPropsToRender>,
): EditorPlugin => {
  const store = createEditorPluginStore<ITogglePluginStore>({
    getEditorState: undefined,
    setEditorState: undefined,
  });
  const { toggleBlockType } = useBlockTypes();
  const { setBlockDepth } = useBlockData();
  const { insertEmptyBlockAfter } = useEditorState();

  return {
    blockRendererFn: (contentBlock: ContentBlock) => {
      if (contentBlock.getType() === blockType) {
        return {
          component: BlockToRender,
          props: { store },
        };
      }
      return null;
    },
    initialize: ({ getEditorState, setEditorState, getEditorRef }) => {
      store.updateItem('getEditorState', getEditorState);
      store.updateItem('setEditorState', setEditorState);
      store.updateItem('getEditorRef', getEditorRef);
    },
    blockStyleFn: (contentBlock: ContentBlock) => {
      const type = contentBlock.getType();
      if (type === blockType) {
        return 'dokably-toggle-list-block';
      }
    },
    keyBindingFn: (event: KeyboardEvent, pluginFunctions: PluginFunctions) => {
      const editorState = pluginFunctions.getEditorState();
      let selectionState = editorState.getSelection();
      let anchorKey = selectionState.getAnchorKey();
      let currentContent = editorState.getCurrentContent();
      let contentBlock = currentContent.getBlockForKey(anchorKey);
      if (contentBlock && contentBlock.getType() === blockType) {
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
          } else if (contentBlock.getData().get('state')) {
            return 'insert_block_into_toggle';
          } else {
            return 'insert_block_after_toggle';
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
      if (command === 'insert_block_into_toggle') {
        const editorState = pluginFunctions.getEditorState();
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

        let newEditorState = EditorState.push(
          editorState,
          nextContentState,
          'split-block',
        );

        const newBlock = newEditorState.getCurrentContent().getBlocksAsArray()[
          blockIndex + 1
        ];

        newEditorState = toggleBlockType(
          newEditorState,
          BlockType.Text,
          newBlock,
        );
        let depth = contentBlock.getDepth() + 1;
        newEditorState = setBlockDepth(
          newEditorState,
          newBlock.getKey(),
          depth,
        );

        pluginFunctions.setEditorState(newEditorState);

        return 'handled';
      }

      if (command === 'insert_block_after_toggle') {
        const editorState = pluginFunctions.getEditorState();
        let selectionState = editorState.getSelection();
        let anchorKey = selectionState.getAnchorKey();
        let currentContent = editorState.getCurrentContent();
        let contentBlock = currentContent.getBlockForKey(anchorKey);

        let nestedblocks = getNestedBlocks(
          contentBlock,
          editorState.getCurrentContent().getBlocksAsArray(),
        );
        let prevBlock = nestedblocks[nestedblocks.length - 1] || contentBlock;

        let newEditorState = insertEmptyBlockAfter(
          editorState,
          prevBlock.getKey(),
          {
            depth: contentBlock.getDepth(),
            type: BlockType.Toggle,
          },
        );

        pluginFunctions.setEditorState(newEditorState);

        return 'handled';
      }
      return 'not-handled';
    },
  };
};

export default ToggleListPlugin;
