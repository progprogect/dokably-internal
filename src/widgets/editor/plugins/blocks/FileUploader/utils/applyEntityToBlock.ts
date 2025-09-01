import { CharacterMetadata, ContentBlock, ContentState } from 'draft-js';

export function applyEntityToBlock(
  contentState: ContentState,
  block: ContentBlock,
  entityKey: string,
): ContentState {
  const blockCahractersList = block.getCharacterList();
  const newCharacterMetadata = CharacterMetadata.applyEntity(
    CharacterMetadata.create(),
    entityKey,
  );
  const charList = blockCahractersList.insert(
    blockCahractersList.size,
    newCharacterMetadata,
  );

  return contentState.setIn(
    ['blockMap', block.getKey(), 'characterList'],
    charList,
  ) as ContentState;
}
