import { useMutation } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { IProperty } from '@widgets/task-board/types';
import { useCacheInvalidation } from '@app/queries/useCacheInvalidation';

type PayloadType = {
  taskId: string;
  propertyId: string;
  value: string;
};

export const editProperty = async ({
  taskId,
  propertyId,
  value,
}: PayloadType): Promise<IProperty> => {
  const uri = `/frontend/task-board/task/${taskId}/property/${propertyId}/text`;
  const response = await api.put<IProperty>(uri, {
    value,
  });
  return response.data ?? [];
};

export const useEditTaskTextProperty = (boardId?: string) => {
  const { invalidateTasks } = useCacheInvalidation();

  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editProperty,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      if (boardId) invalidateTasks(boardId);
    },
  });

  return {
    editTaskTextProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
