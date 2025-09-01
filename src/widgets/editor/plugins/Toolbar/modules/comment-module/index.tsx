import { EditorState, Modifier } from 'draft-js';
import { useLocalStorage } from 'usehooks-ts';
import { useEffect, useState, useRef } from 'react';

import '@app/styles/index.css';

import ToolbarIconButton from '@features/editor/ToolbarIconButton';
import CommentsInput from '@features/comments/comments-input';

import { Comment as CommentModel } from '@entities/models/Comment';

import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import { ReactComponent as Comment } from '@images/comment.svg';

const CommentModule = ({
  props,
  callback,
  onPanelOpen,
  onPanelClose,
}: {
  props: {
    editorState: EditorState;
    setEditorState: (editorState: EditorState) => void;
  };
  callback: () => void;
  onPanelOpen?: () => void;
  onPanelClose?: () => void;
}) => {
  const { editorState, setEditorState } = props;
  const [, setLocalStorageCommentKey] = useLocalStorage('comment', '');
  const [open, setOpen] = useState(false);
  const savedSelectionRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      savedSelectionRef.current = editorState.getSelection();
      onPanelOpen?.();
    } else {
      savedSelectionRef.current = null;
      onPanelClose?.();
    }
  }, [open, onPanelOpen, onPanelClose, editorState]);

  const handleComment = (comment: CommentModel) => {
    const selection = savedSelectionRef.current || editorState.getSelection();
    
    const contentState = editorState.getCurrentContent();
    const blockKey = selection.getAnchorKey();
    const block = contentState.getBlockForKey(blockKey);
    const start = selection.getStartOffset();
    const entityKey = block.getEntityAt(start);

    let newContentState;
    if (entityKey) {
      const entity = contentState.getEntity(entityKey);
      if (entity.getType() === 'COMMENT') {
        const oldData = entity.getData();
        const updatedComments = [...(oldData.comments || []), comment];
    
        contentState.replaceEntityData(entityKey, { comments: updatedComments });
        newContentState = contentState;
      }
    }

    if (!entityKey || newContentState == null) {
      const contentStateWithEntity = contentState.createEntity('COMMENT', 'MUTABLE', {
        comments: [comment],
      });
      const newEntityKey = contentStateWithEntity.getLastCreatedEntityKey();
    
      newContentState = Modifier.applyEntity(contentStateWithEntity, selection, newEntityKey);
    };
    const newEditorState = EditorState.set(editorState, {
      currentContent: newContentState,
    });

    const finalEditorState = EditorState.forceSelection(newEditorState, selection);
    setEditorState(finalEditorState);
    setLocalStorageCommentKey(comment.id);

    setTimeout(() => {
      setOpen(false);
      callback();
    }, 100);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <ToolbarIconButton 
          tooltipContent='Add comment'
          onMouseDown={(e) => {
            e.preventDefault();
          }}
        >
          <Comment />
        </ToolbarIconButton>
      </PopoverTrigger>
      <PopoverContent 
        autoFocusContent={false}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          const isInsideCommentInput = target.closest('.comment__input-view');
          const isInsidePopover = target.closest('[data-radix-popper-content-wrapper]');
          
          if (!isInsideCommentInput && !isInsidePopover) {
            e.preventDefault();
            setOpen(false);
          } else if (isInsideCommentInput) {
            e.preventDefault();
          }
        }}
        onFocusOutside={(e) => {
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (!target.closest('.comment__input-view')) {
            e.preventDefault();
            setOpen(false);
          }
        }}
      >
        <CommentsInput
          onComment={handleComment} 
          preserveSelection={true}
          onCancel={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
};

export default CommentModule;