import {
  EditorState,
  EntityInstance,
  Modifier,
  RichUtils,
  SelectionState,
} from 'draft-js';

export interface IEntityRange {
  start: number;
  end: number;
  text: string;
}
// The code from here https://github.com/jpuri/draftjs-utils
export function getEntityRange(editorState: EditorState, entityKey: string) {
  const block = getSelectedBlock(editorState); // Get block with selection but it could be block without providede key
  let entityRange;
  block.findEntityRanges(
    // @ts-ignore
    (value) => value.get('entity') === entityKey,
    (start, end) => {
      entityRange = {
        start,
        end,
        text: block.get('text').slice(start, end),
      };
    },
  );

  return entityRange as IEntityRange | void;
}

export function getSelectedBlock(editorState: EditorState) {
  return getSelectedBlocksList(editorState).get(0);
}

/**
 * Function returns collection of currently selected blocks.
 */
export function getSelectedBlocksMap(editorState: EditorState) {
  const selectionState = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const startKey = selectionState.getStartKey();
  const endKey = selectionState.getEndKey();
  const blockMap = contentState.getBlockMap();
  return blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat([[endKey, blockMap.get(endKey)]]);
}

/**
 * Function returns collection of currently selected blocks.
 */
export function getSelectedBlocksList(editorState: EditorState) {
  return getSelectedBlocksMap(editorState).toList();
}

type Entity = {
  blockKey: string;
  start: number;
  end: number;
  entity: EntityInstance;
  entityKey: string;
};

export const getEntities = (
  editorState: EditorState,
  entityType: string | null = null,
) => {
  const content = editorState.getCurrentContent();
  const entities: Entity[] = [];
  content.getBlocksAsArray().forEach((block) => {
    let selectedEntity: any = null;
    block.findEntityRanges(
      (character) => {
        if (character.getEntity() !== null) {
          const entity = content.getEntity(character.getEntity());
          if (!entityType || (entityType && entity.getType() === entityType)) {
            selectedEntity = {
              entityKey: character.getEntity(),
              blockKey: block.getKey(),
              entity: content.getEntity(character.getEntity()),
            };
            return true;
          }
        }
        return false;
      },
      (start, end) => {
        entities.push({ ...selectedEntity, start, end });
      },
    );
  });
  return entities;
};

export const updateEntity = (
  entityKey: string,
  entityData: any,
  editorState: EditorState,
) => {
  const contentState = editorState.getCurrentContent();

  const contentStateUpdated = contentState.mergeEntityData(
    entityKey,
    entityData,
  );

  const contentStateWithComment = Modifier.applyEntity(
    contentStateUpdated,
    editorState.getSelection(),
    entityKey,
  );

  return EditorState.push(editorState, contentStateWithComment, 'apply-entity');
};

export const getEntityData = (editorState: EditorState, entityName: string) => {
  const entities = getEntities(editorState, entityName);
  if (entities.length === 0) return undefined;

  const entity = entities[0];

  return entity.entity.getData();
};

export const toggleEntity = (
  editorState: EditorState,
  targetSelection: SelectionState,
  entityKey: string | null,
) => {
  return RichUtils.toggleLink(editorState, targetSelection, entityKey);
};
