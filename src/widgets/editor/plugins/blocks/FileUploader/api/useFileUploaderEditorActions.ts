import { ContentBlock, ContentState, EditorState } from 'draft-js';
import { getFileEntity } from '../utils/getFileEntity';
import { getEntityData } from '../utils/getEntityData';
import { removeAtomicBlock } from '../utils/removeAtomicBlock';
import { insertTextAtTheEnd } from '../utils/insertTextAtTheEnd';
import { Comment } from '@entities/models/Comment';
import { createCommentEntity } from '../utils/createCommentEntity';
import { applyEntityToBlock } from '../utils/applyEntityToBlock';
import { UploaderFileData } from './useFileUploadingApi';
import { setEntityData } from '@widgets/editor/plugins/utils/setEntityData';

export function useFileUploaderEditorActions({
  contentState,
  editorState,
  block,
  setEditorState,
}: {
  block: ContentBlock;
  contentState: ContentState;
  editorState: EditorState;
  setEditorState: (editorState: EditorState) => EditorState;
}) {
  const removeBlock = () => {
    setEditorState(removeAtomicBlock(editorState, contentState, block));
  };

  const setFileEntityData = (metadata: UploaderFileData | null) => {
    const [entityKey] = getFileEntity(contentState, block);
    if (!entityKey) return;
    const newEditorState = setEntityData(editorState, entityKey, { metadata });

    setEditorState(newEditorState);
  };

  const insertComment = (comment: Comment) => {
    // We need to insert any symbol to attach a comment to it.
    const contentStateWithText = insertTextAtTheEnd(editorState, block, '0');
    const createdEntity = createCommentEntity(contentStateWithText, comment);
    const contentStateWithEntity = applyEntityToBlock(
      createdEntity.contentState,
      block,
      createdEntity.entityKey,
    );

    const newEditorState = EditorState.push(
      editorState,
      contentStateWithEntity,
      'apply-entity',
    );

    setEditorState(newEditorState);
  };

  const removeEntityData = () => {
    setFileEntityData(null);
  };

  const getFileEntityData = () => {
    const [entityKey] = getFileEntity(contentState, block);
    return getEntityData<UploaderFileData>(contentState, entityKey);
  };

  return {
    removeBlock,
    removeEntityData,
    setFileEntityData,
    insertComment,
    getEntityData: getFileEntityData,
  };
}
