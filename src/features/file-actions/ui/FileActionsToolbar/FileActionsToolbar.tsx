import { MouseEvent, useState } from 'react';

import ActionsToolbar from '@shared/uikit/actions-toolbar/ActionsToolbar';
import { ReactComponent as DownloadIcon } from '@shared/images/icons/download.svg';
import { ReactComponent as ScaleIcon } from '@shared/images/icons/scale.svg';
// import { ReactComponent as FullScreenIcon } from '@shared/images/icons/fullscreen.svg';
import { ReactComponent as TrashIcon } from '@shared/images/icons/trash.svg';
import { ReactComponent as CommentIcon } from '@images/comment.svg';
import Tooltip from '@shared/uikit/tooltip';
import IconButton from '@shared/uikit/icon-button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';

import { Comment } from '@entities/models/Comment';

import CommentsInput from '@features/comments/comments-input';

import { FileAction, FileActionsToolbarProps } from './props';
import styles from './styles.module.scss';
import IconLink from '@shared/uikit/icon-link';

function FileActionsToolbar({
  onAction,
  onComment,
  fileUrl,
  fileIsNotAvailable,
  readonly,
}: FileActionsToolbarProps) {
  const [showCommentsPopup, setShowCommentsPopup] = useState<boolean>(false);

  const handleAction = (event: MouseEvent<HTMLButtonElement>) => {
    const action = event.currentTarget.dataset.action as FileAction;
    onAction(action);
  };

  const handleComment = (comment: Comment) => {
    onComment(comment);
    setShowCommentsPopup(false);
  };

  return (
    <ActionsToolbar>
      <Tooltip
        disabled={fileIsNotAvailable}
        content='Download'
        key='download'
      >
        <IconLink
          size='s'
          target='_blank'
          rel='noopener noreferrer'
          href={fileUrl}
          variant='transparent'
          disabled={fileIsNotAvailable}
          aria-label='Download document'
          data-action='download'
          className={styles['icon-button']}
        >
          <DownloadIcon />
        </IconLink>
      </Tooltip>

      <Tooltip
        disabled={fileIsNotAvailable}
        content='Open original'
        key='open_original'
      >
        <IconLink
          size='s'
          href={fileUrl}
          target='_blank'
          rel='noopener noreferrer'
          variant='transparent'
          aria-label='Open original document'
          data-action='open_original'
          disabled={fileIsNotAvailable}
          className={styles['icon-button']}
        >
          <ScaleIcon />
        </IconLink>
      </Tooltip>

      {/**
       * TODO: Implement `expand` feature later
       */}
      {/* <Tooltip
        disabled={fileIsNotAvailable}
        content='Expand'
        key='expand'
      >
        <IconButton
          size='s'
          variant='transparent'
          aria-label='Expand document'
          data-action='expand'
          onClick={handleAction}
          disabled={fileIsNotAvailable}
          className={styles['icon-button']}
        >
          <FullScreenIcon />
        </IconButton>
      </Tooltip> */}

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

      {!readonly && (
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
      )}
    </ActionsToolbar>
  );
}

export default FileActionsToolbar;
