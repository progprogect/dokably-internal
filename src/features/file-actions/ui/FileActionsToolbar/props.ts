import { Comment } from '@entities/models/Comment';

export type FileAction = 'delete' | 'expand';

export type FileActionsToolbarProps = {
  onAction: (action: FileAction) => void;
  onComment: (comment: Comment) => void;
  fileIsNotAvailable?: boolean;
  fileUrl?: string;
  readonly?: boolean;
};
