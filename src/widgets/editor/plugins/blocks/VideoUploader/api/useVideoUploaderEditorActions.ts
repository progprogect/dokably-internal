import { ContentBlock, ContentState, EditorState } from 'draft-js';
import { getVideoEntity } from '../utils/getVideoEntity';
import { getEntityData } from '../utils/getEntityData';
import { removeAtomicBlock } from '../utils/removeAtomicBlock';
import { insertTextAtTheEnd } from '../utils/insertTextAtTheEnd';
import { Comment } from '@entities/models/Comment';
import { createCommentEntity } from '../utils/createCommentEntity';
import { applyEntityToBlock } from '../utils/applyEntityToBlock';
import { UploaderFileData } from '@widgets/editor/plugins/blocks/FileUploader/api/useFileUploadingApi';
import { setEntityData } from '@widgets/editor/plugins/utils/setEntityData';

export type VideoEntityData = Omit<UploaderFileData, 'extension'> & {
  extension: 'pdf' | 'doc' | 'mp4' | 'webm' | 'mov' | 'avi' | 'mpeg' | 'embed' | 'unknown';
  embedUrl?: string;
  title?: string;
  // for video caption
};

export function useVideoUploaderEditorActions({
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

  const setVideoEntityData = (metadata: UploaderFileData | VideoEntityData | null) => {
    // Get fresh content state and block
    const currentContentState = editorState.getCurrentContent();
    const currentBlock = currentContentState.getBlockForKey(block.getKey());
    
    if (!currentBlock) return;
    
    const [entityKey] = getVideoEntity(currentContentState, currentBlock);
    if (!entityKey) return;
    
    const newEditorState = setEntityData(editorState, entityKey, { metadata });
    setEditorState(newEditorState);
  };

  const setEmbedData = (embedUrl: string, title?: string) => {
    const embedData: VideoEntityData = {
      id: `embed_${Date.now()}`,
      name: title || 'Video',
      mimeType: 'video/embed',
      extension: 'embed',
      size: 0,
      url: embedUrl,
      embedUrl,
      title,
    };
    setVideoEntityData(embedData);
  };

  const insertComment = (comment: Comment) => {
    try {

      
      // We need to insert any symbol to attach a comment to it.
      const contentStateWithText = insertTextAtTheEnd(editorState, block, '0');

      
      // IMPORTANT: Get the updated block from the new content state!
      const updatedBlock = contentStateWithText.getBlockForKey(block.getKey());
      
      const createdEntity = createCommentEntity(contentStateWithText, comment);

      
      const contentStateWithEntity = applyEntityToBlock(
        createdEntity.contentState,
        updatedBlock, // Use updated block instead of original
        createdEntity.entityKey,
        1, // Length of inserted text ('0')
      );


      const newEditorState = EditorState.push(
        editorState,
        contentStateWithEntity,
        'apply-entity',
      );


      setEditorState(newEditorState);

      
    } catch (error) {
      console.error('❌ VideoUploader: Error in insertComment:', error);
      throw error;
    }
  };

  const removeEntityData = () => {
    setVideoEntityData(null);
  };

  const getVideoEntityData = (): VideoEntityData | null => {
    // Use fresh content state to get current entity data
    const currentContentState = editorState.getCurrentContent();
    const currentBlock = currentContentState.getBlockForKey(block.getKey());
    
    if (!currentBlock) return null;
    
    const [entityKey] = getVideoEntity(currentContentState, currentBlock);
    return getEntityData<VideoEntityData>(currentContentState, entityKey);
  };

  return {
    removeBlock,
    removeEntityData,
    setVideoEntityData,
    setEmbedData,
    insertComment,
    getVideoEntityData,
  };
}
