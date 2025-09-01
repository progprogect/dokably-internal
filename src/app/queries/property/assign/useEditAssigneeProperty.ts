import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { IProperty } from '@widgets/task-board/types';

type PayloadType = {
  taskId: string;
  propertyId: string;
  userIds: string[];
};

export const editAssigneeProperty = async ({
  taskId,
  propertyId,
  userIds,
}: PayloadType): Promise<IProperty> => {
  const uri = `/frontend/task-board/task/${taskId}/property/${propertyId}/assignee`;
  const response = await api.put<IProperty>(uri, {
    value: userIds,
  });
  return response.data ?? [];
};

export const useEditAssigneeProperty = (boardId?: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editAssigneeProperty,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      boardId &&
        queryClient.invalidateQueries({ queryKey: ['getTasks', boardId] });
    },
  });

  return {
    editAssigneeProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
