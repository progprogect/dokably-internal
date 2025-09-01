import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ITask } from '@widgets/task-board/types';

type PayloadType = {
  taskId: string;
  task: Omit<ITask, 'id'>;
};

export const editTask = async ({ taskId, task }: PayloadType): Promise<ITask> => {
  const uri = `/frontend/task-board/task/${taskId}`;
  const response = await api.put<ITask>(uri, {
    ...task,
  });
  return response.data ?? [];
};

export const useEditTask = (boardId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editTask,
    onError: (error) => errorHandler(error),
    onSuccess: (_, variables) => {
      if (boardId) {
        void queryClient.invalidateQueries({ queryKey: ['getTasks', boardId] });
      }

      if (variables.taskId) {
        void queryClient.invalidateQueries({ queryKey: ['getTask', variables.taskId] });
      }
    },
  });

  return {
    editTask: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
