import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ISelectProperty } from '@widgets/task-board/types';

type PayloadType = {
  boardId: string;
  propertyId: string;
} & ISelectProperty;

export const editSelectProperty = async ({ boardId, propertyId, ...body }: PayloadType): Promise<ISelectProperty> => {
  const uri = `/frontend/task-board/${boardId}/property/${propertyId}/select`;
  const response = await api.put<ISelectProperty>(uri, body);
  return response.data ?? [];
};

export const useEditSelectProperty = (boardId: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editSelectProperty,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getProperties', boardId] });
    },
  });

  return {
    editSelectProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
