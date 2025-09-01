import { useMutation } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { IProperty } from '@widgets/task-board/types';

type PayloadType = {
  unitId: string;
  name: string;
};

export const createAssigneeProperty = async ({
  unitId,
  name,
}: PayloadType): Promise<IProperty> => {
  const uri = `/frontend/task-board/${unitId}/assignee`;
  const response = await api.post<IProperty>(uri, {
    name: name,
  });
  return response.data ?? [];
};

export const useCreateAssigneeProperty = () => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: createAssigneeProperty,
    onError: (error) => errorHandler(error),
  });

  return {
    createAssigneeProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
