import { CharacterMetadata, ContentBlock, ContentState, Modifier, SelectionState } from 'draft-js';

export function applyEntityToBlock(
  contentState: ContentState,
  block: ContentBlock,
  entityKey: string,
  textLength = 1, // Длина добавленного текста (по умолчанию 1 символ)
): ContentState {
  // Используем правильный Draft.js API для применения entity
  const blockKey = block.getKey();
  const blockLength = block.getLength();
  
  // Создаем селекцию для последних добавленных символов
  const selectionState = SelectionState.createEmpty(blockKey).merge({
    anchorOffset: blockLength - textLength,
    focusOffset: blockLength,
  });

  // Применяем entity к выбранным символам
  return Modifier.applyEntity(contentState, selectionState, entityKey);
}
