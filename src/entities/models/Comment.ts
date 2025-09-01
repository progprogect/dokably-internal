export interface Comment {
  id: string;
  orderIndex: number;
  date: Date;
  author: string;
  message: string;
  replies?: Comment[];
}

export interface CommentEntity {
  comments: Comment[];
}
