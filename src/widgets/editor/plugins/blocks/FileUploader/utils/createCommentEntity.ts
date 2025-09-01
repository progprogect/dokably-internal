import { Comment } from '@entities/models/Comment';
import { ContentState } from 'draft-js';

export function createCommentEntity(
  contentState: ContentState,
  comment: Comment,
): { contentState: ContentState; entityKey: string } {
  const contentStateWithEntity = contentState.createEntity(
    'COMMENT',
    'MUTABLE',
    comment,
  );

  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

  return { contentState: contentStateWithEntity, entityKey };
}
