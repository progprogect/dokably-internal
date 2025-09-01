import { ContentBlock, ContentState, EntityInstance } from 'draft-js';
import { FILE_ENTITY_TYPE } from '../constants/file-entity-type';

type EntityId = string;

export function getFileEntity(
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

  const fileEntity = indexedEntities.find((entityTuple) => {
    if (!entityTuple) return false;
    const [entityId, entity] = entityTuple;
    return (
      blockEntitiesIds.has(entityId) && entity.getType() === FILE_ENTITY_TYPE
    );
  });

  return fileEntity ?? [null, null];
}
