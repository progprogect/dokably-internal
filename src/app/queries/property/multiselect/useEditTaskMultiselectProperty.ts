import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ISelectProperty } from '@widgets/task-board/types';

type PayloadType = {
  taskId: string;
  propertyId: string;
  value: string[],
};

export const editMultiselectProperty = async ({
  taskId,
  propertyId,
  value,
}: PayloadType): Promise<ISelectProperty> => {
  const uri = `/frontend/task-board/task/${taskId}/property/${propertyId}/multiselect`;
  const response = await api.put<ISelectProperty>(uri, {
    value: value,
  });
  return response.data ?? [];
};

export const useEditMultiselectProperty = (boardId?: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editMultiselectProperty,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      boardId &&
        queryClient.invalidateQueries({ queryKey: ['getTasks', boardId] });
    },
  });

  return {
    editMultiselectProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
