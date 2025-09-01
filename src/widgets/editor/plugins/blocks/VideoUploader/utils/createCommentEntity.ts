import { ContentState } from 'draft-js';
import { Comment } from '@entities/models/Comment';

export function createCommentEntity(contentState: ContentState, comment: Comment) {
  // Use the standard format: { comments: [comment] } - same as text blocks
  const contentStateWithEntity = contentState.createEntity('COMMENT', 'MUTABLE', { comments: [comment] });
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  
  return {
    contentState: contentStateWithEntity,
    entityKey,
  };
}
