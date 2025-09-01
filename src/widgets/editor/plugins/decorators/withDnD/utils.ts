import { ContentState } from 'draft-js';

const getElement = (key: string) => {
  return document.querySelector(
    `[data-offset-key="${key}-0-0"][data-block="true"]`
  );
};

const getBlockPosition = (key: string) => {
  const element = getElement(key);
  const rect = element?.getBoundingClientRect();
  return {
    clientX: rect?.x || 0,
    clientY: rect?.y || 0,
    clientHeight: rect?.height || 0,
  };
};

export const getBlocksClientPositions = (contentState: ContentState) => {
  const blocks = contentState.getBlocksAsArray();
  const positions = blocks.map((block) => {
    return { key: block.getKey(), position: getBlockPosition(block.getKey()) };
  });
  return positions;
};

export const getBlockUnder = (contentState: ContentState, position: any) => {
  return getBlocksClientPositions(contentState)
    .filter((x) => x.position.clientY < position.clientY)
    .pop();
};

export const getOrSetDraggableDelimiter = (): HTMLElement => {
  let draggableDelimiter = document.getElementById('draggable__delimiter');
  if (!draggableDelimiter) {
    draggableDelimiter = document.createElement('div');
    draggableDelimiter.id = 'draggable__delimiter';
    const editorContainer = document.getElementById('editor-container');
    if (editorContainer) {
      editorContainer.append(draggableDelimiter);
    }
  }
  return draggableDelimiter;
};
