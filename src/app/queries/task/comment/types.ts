export interface ServerCommentModel {
  id: string;
  description: string;
  createdAt: Date;
  creator: {
    id: string;
    email: string;
    name: string;
    deleted: boolean;
  };
}