import { track } from '@amplitude/analytics-browser';
import { BASE_API } from '@app/constants/endpoints';
import {
  ContentState,
  EditorState,
  ContentBlock,
  convertFromRaw,
  SelectionState,
  convertToRaw,
  RawDraftContentState,
} from 'draft-js';
import { IDocument } from '@entities/models/IDocument';
import { Unit } from '@entities/models/unit';
import customFetch from '@app/utils/customFetch';
import deepDiff from 'deep-diff';

export const createDocument = async (
  parentId: string,
  documentId: string,
  documentName?: string,
): Promise<Unit | null> => {
  const rawResponse = await customFetch(`${BASE_API}/frontend/document`, {
    method: 'POST',
    body: JSON.stringify({
      unitId: parentId,
      id: documentId,
      name: documentName || 'Untitled',
    }),
  });
  if (rawResponse.ok) {
    track('document_create_action');
  }
  return await rawResponse.json();
};

export const getConnectionToken = async () => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/user/messaging/connection-token`,
  );
  return await rawResponse.json();
};

export const getSubscriptionToken = async (documentId: string) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/unit/${documentId}/messaging/subscription-token`,
  );
  return await rawResponse.json();
};

export const getDocument = async (
  documentId: string,
  options?: { signal?: AbortSignal },
): Promise<IDocument> => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/document/${documentId}`,
    { signal: options?.signal },
  );
  if (rawResponse.status === 404) {
    //window.location.href = '/404';
  }
  return await rawResponse.json();
};

export const setDocument = async (
  documentId: string,
  documentState: string,
) => {
  const tempState = JSON.parse(documentState);
  const state = getComfortableState(tempState);

  const requestBody = {
    data: { state: JSON.stringify(state) },
  };

  await customFetch(`${BASE_API}/frontend/document/${documentId}/state`, {
    method: 'PUT',
    body: JSON.stringify(requestBody),
  });
};

export const getComfortableState = (
  state: RawDraftContentState,
): RawDraftContentState => {
  return {
    entityMap: state.entityMap,
    blocks: state.blocks.map((block: any) => {
      block.data.isActive = false;
      return {
        key: block.key,
        text: block.text,
        depth: block.depth,
        type: block.type,
        data: block.data,
        entityRanges: block.entityRanges,
        inlineStyleRanges: block.inlineStyleRanges,
      };
    }),
  };
};

export const setContentState = (
  documentState: any,
  unit: Unit,
): EditorState => {
  if (documentState) {
    const rawState: RawDraftContentState = JSON.parse(documentState);
    
    if (rawState.blocks[0] && rawState.blocks[0].type === 'title') {
      rawState.blocks[0].text = unit.name;
    }
    let editorState = EditorState.createWithContent(convertFromRaw(rawState));
    return editorState;
  }
  let editorState = EditorState.createEmpty();
  return editorState;
};

export const compare2ContentStates = (
  state1: ContentState,
  state2: ContentState,
) => {
  return deepDiff(convertToRaw(state1), convertToRaw(state2));
};

export const moveBlock = (
  editorState: EditorState,
  selectionState: SelectionState,
  blockKey: string,
  dropBlockKey: string,
) => {
  const contentState = editorState.getCurrentContent();
  const block = contentState.getBlockForKey(blockKey);
  const blockMap = contentState.getBlockMap();
  let filtered = blockMap.filter((bl) => bl?.getKey() !== blockKey);
  let index = filtered
    .toArray()
    .findIndex((el: ContentBlock) => el.getKey() === dropBlockKey);
  if (index === -1) return editorState;
  const newBlockMap = filtered.toList().insert(index + 1, block);
  const newContentState = ContentState.createFromBlockArray(
    newBlockMap.toArray(),
  );
  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    'move-block',
  );
  return EditorState.forceSelection(
    newEditorState,
    selectionState.merge({
      anchorOffset: selectionState.getAnchorOffset(),
      focusOffset: selectionState.getFocusOffset(),
      isBackward: false,
    }),
  );
};

export const convertToAtomicBlock = (
  editorState: EditorState,
  blockKey: string,
  entityType: string,
  data: any,
) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();

  // Get the text block
  const textBlock = contentState.getBlockForKey(blockKey);
  const text = textBlock.getText();

  // Create a new content block with the same text and the atomic entity type
  const contentBlock = new ContentBlock({
    key: blockKey,
    type: entityType,
    text: text,
    characterList: textBlock.getCharacterList(),
    data: data,
    depth: 0,
    entityRanges: [
      {
        offset: 0,
        length: text.length,
        key: contentState
          .createEntity(entityType, 'MUTABLE', data)
          .getLastCreatedEntityKey(),
      },
    ],
  });

  // Replace the text block with the new atomic block
  const newContentState = contentState.merge({
    blockMap: contentState.getBlockMap().set(blockKey, contentBlock),
    selectionAfter: selectionState.merge({
      anchorKey: blockKey,
      focusKey: blockKey,
      anchorOffset: 0,
      focusOffset: 0,
      isBackward: false,
    }),
  }) as ContentState;

  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    'insert-fragment',
  );
  return EditorState.forceSelection(
    newEditorState,
    newContentState.getSelectionAfter(),
  );
};

export const selectBlockBefore = (
  editorState: EditorState,
  currentKey?: string,
) => {
  currentKey = currentKey ?? editorState.getSelection().getAnchorKey();
  const blockBeforeKey = editorState
    .getCurrentContent()
    .getKeyBefore(currentKey);
  const blockBefore = editorState
    .getCurrentContent()
    .getBlockForKey(blockBeforeKey);

  editorState = EditorState.forceSelection(
    editorState,
    editorState.getSelection().merge({
      focusKey: blockBeforeKey,
      anchorKey: blockBeforeKey,
      focusOffset: blockBefore.getText().length,
      anchorOffset: blockBefore.getText().length,
    }),
  );

  return editorState;
};

export const selectBlock = (editorState: EditorState, key: string) => {
  const selectedBlock = editorState.getCurrentContent().getBlockForKey(key);

  editorState = EditorState.forceSelection(
    editorState,
    editorState.getSelection().merge({
      focusKey: key,
      anchorKey: key,
      focusOffset: selectedBlock.getText().length,
      anchorOffset: selectedBlock.getText().length,
    }),
  );

  return editorState;
};
