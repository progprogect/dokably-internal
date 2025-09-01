import { Comment } from '@entities/models/Comment';

export type FileDropzoneAction = 'delete';

export type FileActionsToolbarProps = {
  onAction: (action: FileDropzoneAction) => void;
  onComment: (comment: Comment) => void;
};
