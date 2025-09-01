import { ContentBlock, ContentState } from 'draft-js';

export function getVideoEntity(contentState: ContentState, block: ContentBlock): [string | null, any] {
  // Use robust approach similar to FileUploader - search through character list
  const characterList = block.getCharacterList();
  
  for (let i = 0; i < characterList.size; i++) {
    const entityKey = characterList.get(i)?.getEntity();
    if (entityKey) {
      try {
        const entity = contentState.getEntity(entityKey);
        const entityData = entity.getData();
        
        // Check if this entity belongs to the current block
        const blockKey = block.getKey();
        if (entityData.blockKey === blockKey || entityData.blockId === blockKey) {
          return [entityKey, entity];
        }
      } catch (error) {
        continue;
      }
    }
  }
  
  // Fallback to original method if no matching entity found
  const entityKey = block.getEntityAt(0);
  return [entityKey, entityKey ? contentState.getEntity(entityKey) : null];
}
