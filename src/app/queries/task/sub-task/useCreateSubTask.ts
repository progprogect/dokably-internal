import { useMutation } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ITask } from '@widgets/task-board/types';

type PayloadType = {
  unitId: string;
  name: string;
};

export const createSubTask = async ({
  unitId,
  name,
}: PayloadType): Promise<ITask> => {
  const uri = `/frontend/task-board/${unitId}/task`;
  const response = await api.post<ITask>(uri, {
    name: name,
  });
  return response.data ?? [];
};

export const useCreateSubTask = () => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: createSubTask,
    onError: (error) => errorHandler(error),
  });

  return {
    createSubTask: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
