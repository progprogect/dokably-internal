import { useMutation } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ISelectProperty } from '@widgets/task-board/types';

type PayloadType = {
  unitId: string;
  name: string;
  options?: any[];
};

export const createSelectProperty = async ({
  unitId,
  name,
  options,
}: PayloadType): Promise<ISelectProperty> => {
  const uri = `/frontend/task-board/${unitId}/select`;
  const response = await api.post<ISelectProperty>(uri, {
    name: name,
    options: options,
  });
  return response.data ?? [];
};

export const useCreateSelectProperty = () => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: createSelectProperty,
    onError: (error) => errorHandler(error),
  });

  return {
    createSelectProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
