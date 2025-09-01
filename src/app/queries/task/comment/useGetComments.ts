import { useQuery } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { Comment as CommentModel } from '@entities/models/Comment';
import { ServerCommentModel } from './types';

type Payload = {
  taskId: string;
  enabled?: boolean;
};

const getComments = async (taskId: string): Promise<ServerCommentModel[]> => {
  const uri = `/frontend/task/${taskId}/comment`;
  const response = await api.get<ServerCommentModel[]>(uri);
  return response.data ?? [];
};

export const useGetComments = ({ taskId, enabled = true }: Payload) => {
  const {
    error,
    data: comments,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ['getComments', taskId],
    queryFn: () => getComments(taskId),
    enabled: enabled,
    select: (data) => {
      return data.map(
        (comment, index) =>
          ({
            id: comment.id,
            date: comment.createdAt,
            message: comment.description,
            author: comment.creator.name ?? comment.creator.email,
            orderIndex: index,
          }) as CommentModel,
      );
    },
  });

  if (error) errorHandler(error);

  return {
    comments: comments ? comments : [],
    refetch,
    isPending,
  };
};
