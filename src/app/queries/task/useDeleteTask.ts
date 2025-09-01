import { useMutation, useQueryClient } from "@tanstack/react-query"


import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

const deleteTask = async (taskId: string): Promise<any> => {
  const uri = `/frontend/task-board/task/${taskId}`;
  const response = await api.delete(uri);
  return response.data ?? [];
}

export const useDeleteTask = (boardId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: deleteTask,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      boardId &&
        queryClient.invalidateQueries({ queryKey: ['getTasks', boardId] });
    },
  });

  return {
    isPending,
    isSuccess,
    deleteTask: mutateAsync
  }
}
