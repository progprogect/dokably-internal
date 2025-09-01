import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { Comment as CommentModel } from '@entities/models/Comment';
import { ServerCommentModel } from './types';

type PayloadType = {
  taskId: string;
  text: string;
};

export const createComment = async ({
  taskId,
  text,
}: PayloadType): Promise<CommentModel> => {
  const uri = `/frontend/task/${taskId}/comment`;
  const response = (
    await api.post<ServerCommentModel>(uri, {
      description: text,
    })
  ).data;

  return {
    id: response.id,
    date: response.createdAt,
    message: response.description,
    author: response.creator.name ?? response.creator.email,
    orderIndex: 0,
  } as CommentModel;
};

export const useCreateComment = (taskId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: createComment,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getComments', taskId] });
    },
  });

  return {
    createComment: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
