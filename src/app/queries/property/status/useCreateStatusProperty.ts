import { useMutation } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ISelectProperty } from '@widgets/task-board/types';

type PayloadType = {
  unitId: string;
  name: string;
  options?: any[];
};

export const createStatusProperty = async ({
  unitId,
  name,
  options,
}: PayloadType): Promise<ISelectProperty> => {
  const uri = `/frontend/task-board/${unitId}/status`;
  const response = await api.post<ISelectProperty>(uri, {
    name: name,
    options: options,
  });
  return response.data ?? [];
};

export const useCreateStatusProperty = () => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: createStatusProperty,
    onError: (error) => errorHandler(error),
  });

  return {
    createStatusProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
