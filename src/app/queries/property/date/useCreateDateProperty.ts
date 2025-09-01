import { useMutation } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ISelectProperty } from '@widgets/task-board/types';

type PayloadType = {
  unitId: string;
  name: string;
};

export const createDateProperty = async ({
  unitId,
  name,
}: PayloadType): Promise<ISelectProperty> => {
  const uri = `/frontend/task-board/${unitId}/date`;
  const response = await api.post<ISelectProperty>(uri, {
    name: name,
  });
  return response.data ?? [];
};

export const useCreateDateProperty = () => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: createDateProperty,
    onError: (error) => errorHandler(error),
  });

  return {
    createDateProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
