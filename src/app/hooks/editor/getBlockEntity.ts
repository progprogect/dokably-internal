import { ContentBlock, ContentState, EntityInstance } from 'draft-js';

type EntityId = string;

export function getBlockEntity(
  entityType: string,
  contentState: ContentState,
  block: ContentBlock,
): [string, EntityInstance] | [null, null] {
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

  const entity = indexedEntities.find((entityTuple) => {
    if (!entityTuple) return false;
    const [entityId, entity] = entityTuple;
    return blockEntitiesIds.has(entityId) && entity.getType() === entityType;
  });

  return entity ?? [null, null];
}
