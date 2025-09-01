import { v4 as uuidv4 } from 'uuid';
import { EditorState, Modifier, RichUtils, SelectionState } from 'draft-js';

import useUser from '@app/hooks/useUser';
import CommentsInfo from '@features/comments/comments-info';

import { findAllBlockEntitiesByType } from '../../utils/findAllBlockEntitiesByType';
import {
  PluginBlockPropsToRender,
  PluginBlockToRender,
  PluginProps,
} from '../../types';
import { Comment, CommentEntity } from '@entities/models/Comment';
import { setEntityData } from '../../utils/setEntityData';
import { useMemo } from 'react';
import { isArray } from 'lodash';

export const withComments = <P extends PluginBlockPropsToRender>(
  WrappedComponent: PluginBlockToRender<P>,
) => {
  return (props: PluginProps<P>) => {
    const block = props.block;
    const blockKey = props.block.getKey();
    const store = props.blockProps.store;
    const user = useUser();
    const getEditorState = store.getItem('getEditorState');
    const setEditorState = store.getItem('setEditorState');
    const editorState = getEditorState?.();
    if (!editorState) return null;

    const allBlockEntities = findAllBlockEntitiesByType(
      editorState.getCurrentContent(),
      block,
      'COMMENT',
    ).toArray();
    

    


    const blockCommentsData = useMemo(() => {
      if (allBlockEntities.length && isArray(allBlockEntities[0])) {
        // Use the same logic as reduce path for consistency
        const result = allBlockEntities?.reduce((prev: Comment[], [, blockEntity]) => {
          const entityData = blockEntity.getData();
          
          // Handle both new standard format and old format for backward compatibility
          if (entityData?.comments) {
            // New standard format: { comments: [Comment] }
            return [...prev, ...entityData.comments];
          } else if (entityData?.id && entityData?.message) {
            // Old format: direct Comment object (backward compatibility)
            return [...prev, entityData as Comment];
          }
          
          return prev;
        }, []);
        
        return result || [];
      } else {
        const result = allBlockEntities?.reduce((prev: Comment[], [, blockEntity]) => {
          const entityData = blockEntity.getData();
          
          // Handle both new standard format and old format for backward compatibility
          if (entityData?.comments) {
            // New standard format: { comments: [Comment] }
            return [...prev, ...entityData.comments];
          } else if (entityData?.id && entityData?.message) {
            // Old format: direct Comment object (backward compatibility)
            return [...prev, entityData as Comment];
          }
          
          return prev;
        }, []);
        
        if (block.getType() === 'atomic') {
          // Keep original atomic block logic
        }
        
        return result || [];
      }
    }, [allBlockEntities]);

    const findEntityById = (entityId: string) => {
      return allBlockEntities.find(([, blockEntity]) => {
        const entityData = blockEntity.getData();
        
        // Handle both new standard format and old format for backward compatibility
        if (entityData?.comments) {
          // New standard format: { comments: [Comment] }
          return entityData.comments.map((comment: Comment) => comment.id).includes(entityId);
        } else if (entityData?.id && entityData?.message) {
          // Old format: direct Comment object (backward compatibility)
          return entityData.id === entityId;
        }
        
        return false;
      });
    };

    const updateEntity = (entityKey: string, commentEntity: CommentEntity) => {
      setEditorState?.(setEntityData(editorState, entityKey, commentEntity));
    };

    const handleDeleteComment = (id: string) => {
      const entity = findEntityById(id);
      if (!entity) return;
      const [entityKey, entityData] = entity;

      let _contentState = editorState.getCurrentContent();
      let _editorState = editorState;

      const entityTemp = entityData.getData();
      if (entityTemp.comments.length === 1) {
        block.findEntityRanges(
          (character) => character.getEntity() === entityKey,
          (start, end) => {
            const selectionState = SelectionState.createEmpty(blockKey).merge({
              anchorOffset: start,
              focusOffset: end,
            });

            _contentState = Modifier.applyEntity(
              _contentState,
              selectionState,
              null,
            );

            _editorState = RichUtils.toggleLink(
              editorState,
              selectionState,
              entityKey,
            );
          },
        );

        setEditorState?.(
          EditorState.push(_editorState, _contentState, 'apply-entity'),
        );
      } else {
        const withDeletedComment: CommentEntity = {
          comments: entityTemp.comments.filter((comment: Comment) => comment.id !== id)
        };
        updateEntity(entityKey, withDeletedComment);
      }
    };

    const handleReply = (id: string, message: string) => {
      if (!user) return;

      const entityTuple = findEntityById(id);
      if (!entityTuple) return;

      const [entityKey, entity] = entityTuple;
      const entityData = entity.getData();

      const reply = {
        id: uuidv4(),
        orderIndex: 0,
        date: new Date(),
        author: user.name ?? user.email,
        message: message,
      } as Comment;

      // Handle both new standard format and old format for backward compatibility
      let withReply;
      
      if (entityData.comments) {
        // New standard format: { comments: [Comment] }
        withReply = {
          comments: entityData.comments.map((comment: Comment) => comment.id === id ? {
            ...comment,
            replies: [...(comment.replies ?? []), reply],
          } : comment)
        };
      } else if (entityData.id && entityData.message) {
        // Old format: direct Comment object - convert to new format
        withReply = {
          comments: [{
            ...entityData,
            replies: [...(entityData.replies ?? []), reply],
          } as Comment]
        };
      } else {
        return;
      }

      updateEntity(entityKey, withReply);
    };

    const handleReplyDelete = (id: string, replyId: string) => {
      const entityTuple = findEntityById(id);
      if (!entityTuple) return;
      const [entityKey, entity] = entityTuple;

      const entityData = entity.getData();

      // Handle both new standard format and old format for backward compatibility
      let replies: Comment[] | undefined;
      let withoutReply;
      
      if (entityData.comments) {
        // New standard format: { comments: [Comment] }
        replies = entityData.comments.find((comment: Comment) => comment.id === id)?.replies;
        if (!replies) return;
        
        withoutReply = {
          comments: entityData.comments.map((comment: Comment) => comment.id === id ? {
            ...comment,
            replies: comment.replies ? comment.replies.filter((reply) => reply.id !== replyId) : [],
          } : comment)
        };
      } else if (entityData.id === id) {
        // Old format: direct Comment object - convert to new format
        replies = entityData.replies;
        if (!replies) return;
        
        withoutReply = {
          comments: [{
            ...entityData,
            replies: entityData.replies ? entityData.replies.filter((reply: Comment) => reply.id !== replyId) : [],
          } as Comment]
        };
      } else {
        return;
      }

      updateEntity(entityKey, withoutReply);
    };

    const repliesSum = blockCommentsData.reduce<number>(
      (acc, { replies }) => (replies?.length ? acc + replies.length : acc),
      0,
    );

    if (!user || !blockCommentsData.length) {
      return <WrappedComponent {...props} />;
    }

    return (
      <div className='relative w-full'>
        <WrappedComponent {...props} />
        <CommentsInfo
          count={blockCommentsData.length + repliesSum}
          comments={blockCommentsData}
          onDelete={handleDeleteComment}
          onReply={handleReply}
          onReplyDelete={handleReplyDelete}
        />


      </div>
    );
  };
};
