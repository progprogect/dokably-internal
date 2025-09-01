import { ContentBlock, ContentState, EditorState, genKey, SelectionState } from 'draft-js';
import { useCallback } from 'react';

import BlockType from '@entities/enums/BlockType';
import { EMBEDS_BLOCK_TYPES } from '@app/constants/embeds';

export const useEditorSelection = () => {
  const syncBrowserSelectionToEditor = useCallback((editorState: EditorState): EditorState => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return editorState;
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    let blockElement = null;
    if (container.nodeType === Node.TEXT_NODE) {
      blockElement = container.parentElement?.closest('[data-offset-key]');
    } else {
      blockElement = (container as Element).closest('[data-offset-key]');
    }

    if (!blockElement) {
      return editorState;
    }

    const offsetKey = blockElement.getAttribute('data-offset-key');
    if (!offsetKey) {
      return editorState;
    }

    const blockKey = offsetKey.split('-')[0];
    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey(blockKey);

    if (!block || block.getType() !== BlockType.Text) {
      return editorState;
    }

    const selectionState = editorState.getSelection();

    return EditorState.forceSelection(editorState, selectionState);
  }, []);

  const handleKeyDownInEditor = useCallback(
    (event: React.KeyboardEvent, editorState: EditorState) => {
      const { key } = event;
      const selectionState = editorState.getSelection();
      const contentState = editorState.getCurrentContent();
      const currentBlock = contentState.getBlockForKey(selectionState.getAnchorKey());

      if (currentBlock && currentBlock.getType() === BlockType.Text) {
        if (
          key === 'ArrowUp' ||
          key === 'ArrowDown' ||
          key === 'ArrowLeft' ||
          key === 'ArrowRight' ||
          key === 'Backspace' ||
          key === 'Delete' ||
          key === 'Enter'
        ) {
          return syncBrowserSelectionToEditor(editorState);
        }
      }
      return editorState;
    },
    [syncBrowserSelectionToEditor],
  );

  const handleClickInEditor = (editorState: EditorState, event: React.MouseEvent, force?: boolean): EditorState => {
    const contentBlocks = editorState.getCurrentContent().getBlocksAsArray();
    const lastBlock =
      contentBlocks.length > 0 &&
      contentBlocks[contentBlocks.length - 1] &&
      contentBlocks[contentBlocks.length - 1].getType() !== BlockType.Title
        ? contentBlocks[contentBlocks.length - 1]
        : null;
    const elementMouseIsOver = document.elementFromPoint(event.clientX, event.clientY);

    const target = event.target as HTMLElement;
    const textBlockElement = target.closest('.dokably-text-block');

    if (textBlockElement) {
      const draftBlockElement =
        textBlockElement.querySelector('[data-block]') || textBlockElement.querySelector('[data-offset-key]');

      if (draftBlockElement) {
        const offsetKey = draftBlockElement.getAttribute('data-offset-key');
        if (offsetKey) {
          const blockKey = offsetKey.split('-')[0];
          const block = editorState.getCurrentContent().getBlockForKey(blockKey);

          if (block && block.getType() === BlockType.Text) {
            const selection = window.getSelection();

            if (selection && selection.rangeCount > 0) {
              const selectionState = editorState.getSelection();
              return EditorState.forceSelection(editorState, selectionState);
            }
          }
        }
      }
    }

    if (
      (elementMouseIsOver?.id === 'editor-container' &&
        (!lastBlock ||
          (lastBlock && lastBlock.getText().length !== 0) ||
          lastBlock.getData().get('isShow') === false ||
          lastBlock.getType() === BlockType.Kanban ||
          BlockType.ListView ||
          EMBEDS_BLOCK_TYPES.includes(lastBlock.getType() as BlockType))) ||
      force
    ) {
      const newBlock = new ContentBlock({
        key: genKey(),
        type: 'unstyled',
        text: '',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
      });
      const selectionState = editorState.getSelection();
      const newSelection = selectionState.merge({
        focusKey: newBlock.getKey(),
        anchorKey: newBlock.getKey(),
        focusOffset: 0,
        anchorOffset: 0,
      });
      const contentState = editorState.getCurrentContent();
      const newBlockMap = contentState.getBlockMap().set(newBlock.getKey(), newBlock);

      editorState = EditorState.push(
        editorState,
        ContentState.createFromBlockArray(newBlockMap.toArray()),
        'insert-fragment',
      );
      return EditorState.forceSelection(editorState, newSelection);
    }
    return editorState;
  };

  return {
    handleClickInEditor,
    handleKeyDownInEditor,
    syncBrowserSelectionToEditor,
  };
};
