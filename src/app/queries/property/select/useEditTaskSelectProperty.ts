import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ISelectProperty } from '@widgets/task-board/types';

type PayloadType = {
  taskId: string;
  propertyId: string;
  optionId: string;
};

export const editSelectProperty = async ({
  taskId,
  propertyId,
  optionId,
}: PayloadType): Promise<ISelectProperty> => {
  const uri = `/frontend/task-board/task/${taskId}/property/${propertyId}/select`;
  const response = await api.put<ISelectProperty>(uri, {
    value: optionId,
  });
  return response.data ?? [];
};

export const useEditTaskSelectProperty = (boardId?: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editSelectProperty,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      boardId &&
        queryClient.invalidateQueries({ queryKey: ['getTasks', boardId] });
    },
  });

  return {
    editSelectProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
