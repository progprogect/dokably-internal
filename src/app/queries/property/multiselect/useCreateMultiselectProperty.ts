import { useMutation } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ISelectProperty } from '@widgets/task-board/types';

type PayloadType = {
  unitId: string;
  name: string;
  options?: any[];
};

export const createMultiselectProperty = async ({
  unitId,
  name,
  options,
}: PayloadType): Promise<ISelectProperty> => {
  const uri = `/frontend/task-board/${unitId}/multiselect`;
  const response = await api.post<ISelectProperty>(uri, {
    name: name,
    options: options,
  });
  return response.data ?? [];
};

export const useCreateMultiselectProperty = () => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: createMultiselectProperty,
    onError: (error) => errorHandler(error),
  });

  return {
    createMultiselectProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
