import { useMutation } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { Unit } from '@entities/models/unit';

type PayloadType = {
  id: string;
  unitId: string;
  name?: string;
};

export const createTaskBoard = async ({
  id,
  unitId,
  name,
}: PayloadType): Promise<Unit> => {
  const uri = '/frontend/task-board';
  const response = await api.post<Unit>(uri, {
    id: id,
    unitId: unitId,
    name: name,
  });
  return response.data ?? [];
};

export const useCreateTaskBoard = () => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: createTaskBoard,
    onError: (error) => errorHandler(error),
  });

  return {
    createTaskBoard: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
