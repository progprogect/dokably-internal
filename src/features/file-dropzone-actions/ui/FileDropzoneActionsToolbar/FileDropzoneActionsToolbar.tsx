import { MouseEvent, useState } from 'react';

import { ReactComponent as CommentIcon } from '@shared/images/icons/comment-icon-header.svg';
import { ReactComponent as TrashIcon } from '@shared/images/icons/trash.svg';
import ActionsToolbar from '@shared/uikit/actions-toolbar/ActionsToolbar';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import Tooltip from '@shared/uikit/tooltip';
import IconButton from '@shared/uikit/icon-button';

import { Comment } from '@entities/models/Comment';

import CommentsInput from '@features/comments/comments-input';

import styles from './styles.module.scss';
import { FileDropzoneAction, FileActionsToolbarProps } from './props';

function FileDropzoneActionsToolbar({
  onAction,
  onComment,
}: FileActionsToolbarProps) {
  const [showCommentsPopup, setShowCommentsPopup] = useState<boolean>(false);

  const handleAction = (event: MouseEvent<HTMLButtonElement>) => {
    const action = event.currentTarget.dataset.action as FileDropzoneAction;
    onAction(action);
  };

  const handleComment = (comment: Comment) => {
    onComment(comment);
    setShowCommentsPopup(false);
  };

  return (
    <ActionsToolbar>
      <Popover
        open={showCommentsPopup}
        onOpenChange={setShowCommentsPopup}
        key='comment'
      >
        <Tooltip content='Add comment'>
          <PopoverTrigger asChild>
            <IconButton
              size='s'
              variant='transparent'
              aria-label='Add comment'
              className={styles['icon-button']}
            >
              <CommentIcon />
            </IconButton>
          </PopoverTrigger>
        </Tooltip>
        <PopoverContent>
          <CommentsInput onComment={handleComment} />
        </PopoverContent>
      </Popover>

      <Tooltip
        key='delete'
        content='Delete'
      >
        <IconButton
          size='s'
          variant='error'
          aria-label='Delete document'
          data-action='delete'
          onClick={handleAction}
          className={styles['icon-button']}
        >
          <TrashIcon />
        </IconButton>
      </Tooltip>
    </ActionsToolbar>
  );
}

export default FileDropzoneActionsToolbar;
