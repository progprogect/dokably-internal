import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ITask } from '@widgets/task-board/types';

type PayloadType = {
  unitId: string;
  name: string;
};

export const createTask = async ({
  unitId,
  name,
}: PayloadType): Promise<ITask> => {
  const uri = `/frontend/task-board/${unitId}/task`;
  const response = await api.post<ITask>(uri, {
    name: name,
  });
  return response.data ?? [];
};

export const useCreateTask = (boardId?: string, isUpdateTasks = true) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: createTask,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      boardId &&
        isUpdateTasks &&
        queryClient.invalidateQueries({ queryKey: ['getTasks', boardId] });
    },
  });

  return {
    createTask: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
