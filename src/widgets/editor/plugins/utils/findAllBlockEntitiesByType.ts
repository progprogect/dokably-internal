import { ContentBlock, ContentState, EntityInstance } from 'draft-js';

type EntityId = string;

export function findAllBlockEntitiesByType(
  contentState: ContentState,
  block: ContentBlock,
  entityType: string,
): Immutable.Iterable<number, [string, EntityInstance]> {
  const blockEntitiesIds = block
    .getCharacterList()
    .reduce<Set<EntityId>>((acc, character) => {
      const accumulator = acc ?? new Set();
      const characterEntity = character?.getEntity();
      if (characterEntity) accumulator.add(characterEntity);
      return accumulator;
    }, new Set<EntityId>());

  const indexedEntities = contentState
    .getAllEntities()
    .entrySeq() as Immutable.Seq.Indexed<[EntityId, EntityInstance]>;

  return indexedEntities.filter((entityTuple) => {
    if (!entityTuple) return false;
    const [entityId, entity] = entityTuple;
    return blockEntitiesIds.has(entityId) && entity.getType() === entityType;
  });
}
