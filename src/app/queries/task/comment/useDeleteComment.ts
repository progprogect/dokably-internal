import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type Payload = {
  taskId: string;
  commentId: string;
};

const deleteComment = async ({ taskId, commentId }: Payload): Promise<any> => {
  const uri = `/frontend/task/${taskId}/comment/${commentId}`;
  const response = await api.delete(uri);
  return response.data ?? [];
};

export const useDeleteComment = (taskId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: deleteComment,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getComments', taskId] });
    },
  });

  return {
    isPending,
    isSuccess,
    deleteComment: mutateAsync,
  };
};
