import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ITask } from '@widgets/task-board/types';

type PayloadType = {
  taskId: string;
  parentTaskId: string;
};

export const changeParentTask = async ({
  taskId,
  parentTaskId,
}: PayloadType): Promise<ITask> => {
  const uri = `/frontend/task-board/task/${taskId}/parent-task`;
  const response = await api.patch<ITask>(uri, {
    parentTaskId: parentTaskId,
  });
  return response.data ?? [];
};

export const useChangeParentTask = (boardId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: changeParentTask,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      boardId &&
        queryClient.invalidateQueries({ queryKey: ['getTasks', boardId] });
    },
  });

  return {
    changeParentTask: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
