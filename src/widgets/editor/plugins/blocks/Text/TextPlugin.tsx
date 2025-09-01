import { ContentBlock, EditorState, Modifier } from 'draft-js';
import { EditorPlugin, PluginFunctions } from '@draft-js-plugins/editor';

import BlockType from '@entities/enums/BlockType';
import { KeyboardEvent } from 'react';
import useBlockData from '@app/hooks/editor/useBlockData';
import { isValidUrl, getUrlWithProtocol } from '@shared/lib/utils/browser/isValidUrl';
import { PluginBlockPropsToRender, PluginBlockToRender } from '../../types';
import { createEditorPluginStore } from '../../utils/createEditorPluginStore';

interface ITextPluginStore {
  setEditorState?(editorState: EditorState): void;
  getEditorState?(): EditorState;
  getEditorRef?(): {
    refs?: { editor: HTMLElement };
    editor: HTMLElement;
  };
}

const ALLOWED_BLOCK_TYPES = new Set([
  BlockType.Text,
  BlockType.Bold,
  BlockType.Italic,
  BlockType.Underline,
  BlockType.Strikethrough,
]);

const TextPlugin = (BlockToRender: PluginBlockToRender<PluginBlockPropsToRender>): EditorPlugin => {
  const store = createEditorPluginStore<ITextPluginStore>({
    getEditorState: undefined,
    setEditorState: undefined,
  });

  const handleLinkFormatting = (lastSpaceIndex: number, pluginFunctions: PluginFunctions, editorState: EditorState) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const block = currentContent.getBlockForKey(selection.getAnchorKey());
    const text = block.getText().slice(0, selection.getAnchorOffset());
    const word = text.slice(lastSpaceIndex + 1);

    if (!isValidUrl(word)) return;

    const contentStateWithEntity = currentContent.createEntity('LINK', 'MUTABLE', {
      url: getUrlWithProtocol(word),
      target: '_blank',
    });

    const newEditorState = EditorState.set(editorState, {
      currentContent: Modifier.applyEntity(
        contentStateWithEntity,
        selection.merge({
          anchorOffset: lastSpaceIndex + 1,
          focusOffset: selection.getAnchorOffset(),
        }),
        contentStateWithEntity.getLastCreatedEntityKey(),
      ),
    });

    pluginFunctions.setEditorState(newEditorState);
  };

  return {
    blockRendererFn: (contentBlock: ContentBlock) => {
      if (contentBlock.getType() === BlockType.Text) {
        return {
          component: BlockToRender,
          props: {
            store,
          },
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
      if (type === BlockType.Text) {
        return 'dokably-text-block';
      }
    },
    keyBindingFn: (event: KeyboardEvent, pluginFunctions: PluginFunctions) => {
      const editorState = pluginFunctions.getEditorState();
      const selectionState = editorState.getSelection();
      const anchorKey = selectionState.getAnchorKey();
      const currentContent = editorState.getCurrentContent();
      const contentBlock = currentContent.getBlockForKey(anchorKey);
      if (contentBlock && ALLOWED_BLOCK_TYPES.has(contentBlock.getType() as BlockType)) {
        if (event.key === 'Backspace' && !event.shiftKey && !event.altKey && !event.ctrlKey) {
          if (selectionState.isCollapsed()) {
            const prevKey = currentContent.getKeyBefore(anchorKey);
            const prevBlock = currentContent.getBlockMap().get(prevKey);
            const prevBlockIsOpenedToggle =
              prevBlock.getType() === BlockType.Toggle && prevBlock.getData().get('state') === true;
            if (contentBlock.getDepth() !== 0 && selectionState.getAnchorOffset() === 0 && !prevBlockIsOpenedToggle) {
              return 'decrease_depth_command';
            }
          }
        }
        if (event.key === 'Tab' && !event.shiftKey && !event.altKey && !event.ctrlKey) {
          const blockIndex = currentContent
            .getBlocksAsArray()
            .findIndex((el: ContentBlock) => el.getKey() === contentBlock.getKey());
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

        if ((event.key === ' ' || event.key === 'Enter') && !event.shiftKey && !event.altKey && !event.ctrlKey) {
          const anchorOffset = selectionState.getAnchorOffset();
          const text = contentBlock.getText().slice(0, anchorOffset);
          const lastSpaceIndex = text.lastIndexOf(' ');

          handleLinkFormatting(lastSpaceIndex, pluginFunctions, editorState);
        }
      }
    },
  };
};

export default TextPlugin;
