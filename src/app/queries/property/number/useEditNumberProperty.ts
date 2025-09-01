import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { IProperty } from '@widgets/task-board/types';

type PayloadType = {
  taskId: string;
  propertyId: string;
  value: number;
};

export const editNumberProperty = async ({
  taskId,
  propertyId,
  value,
}: PayloadType): Promise<IProperty> => {
  const uri = `/frontend/task-board/task/${taskId}/property/${propertyId}/number`;
  const response = await api.put<IProperty>(uri, {
    value: value,
  });
  return response.data ?? [];
};

export const useEditNumberProperty = (boardId?: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editNumberProperty,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      boardId &&
        queryClient.invalidateQueries({ queryKey: ['getTasks', boardId] });
    },
  });

  return {
    editNumberProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
