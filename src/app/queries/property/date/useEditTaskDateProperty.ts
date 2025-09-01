import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { IProperty } from '@widgets/task-board/types';
import { dateToUnixSeconds } from '@shared/lib/utils/date/date-to-units-seconds';

type PayloadType = {
  taskId: string;
  propertyId: string;
  value: Date | number | null;
};

export const editDateProperty = async ({
  taskId,
  propertyId,
  value,
}: PayloadType): Promise<IProperty> => {
  const _value = value instanceof Date ? dateToUnixSeconds(value) : value;
  const uri = `/frontend/task-board/task/${taskId}/property/${propertyId}/date`;
  const response = await api.put<IProperty>(uri, { value: _value });
  return response.data ?? [];
};

export const useEditTaskDateProperty = (boardId?: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editDateProperty,
    onError: errorHandler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getTasks', boardId] });
    },
  });

  return {
    editTaskDateProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
