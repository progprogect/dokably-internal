import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { IProperty } from '@widgets/task-board/types';

type PayloadType = {
  taskId: string;
  propertyId: string;
  value: string[];
};

export const editFilesProperty = async ({
  taskId,
  propertyId,
  value,
}: PayloadType): Promise<IProperty> => {
  const uri = `/frontend/task-board/task/${taskId}/property/${propertyId}/file`;
  const response = await api.put<IProperty>(uri, {
    value: value,
  });
  return response.data ?? [];
};

export const useEditFilesProperty = (boardId?: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editFilesProperty,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      boardId &&
        queryClient.invalidateQueries({ queryKey: ['getTasks', boardId] });
    },
  });

  return {
    editFilesProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
