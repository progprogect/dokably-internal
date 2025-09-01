import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ITask } from '@widgets/task-board/types';

type PayloadType = {
  unitId: string;
  items: Array<{ id: string; order: number }>;
};

export const sortTasks = async ({ unitId, items }: PayloadType): Promise<ITask> => {
  const uri = `/frontend/task-board/${unitId}/task/sort`;
  const response = await api.patch<ITask>(uri, items);
  return response.data ?? [];
};

export const useTaskSort = (boardId: string | undefined) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: sortTasks,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      if (!boardId) return;
      queryClient.invalidateQueries({ queryKey: ['getTasks', boardId] });
    },
  });

  return {
    sortTasks: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
