import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { IProperty } from '@widgets/task-board/types';

type PayloadType = {
  taskId: string;
  propertyId: string;
  value: string;
};

export const editUrlProperty = async ({
  taskId,
  propertyId,
  value,
}: PayloadType): Promise<IProperty> => {
  const uri = `/frontend/task-board/task/${taskId}/property/${propertyId}/url`;
  const response = await api.put<IProperty>(uri, {
    value: value,
  });
  return response.data ?? [];
};

export const useEditUrlProperty = (boardId?: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editUrlProperty,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      boardId &&
        queryClient.invalidateQueries({ queryKey: ['getTasks', boardId] });
    },
  });

  return {
    editUrlProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
