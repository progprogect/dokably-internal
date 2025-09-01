import { Comment as CommentModel } from '@entities/models/Comment';

export const getDate = (comment:CommentModel) => {
   return new Date(comment.date).toLocaleDateString()
}