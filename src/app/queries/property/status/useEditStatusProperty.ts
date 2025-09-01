import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ISelectProperty } from '@widgets/task-board/types';

type PayloadType = {
  boardId: string;
  propertyId: string;
} & ISelectProperty;

export const editStatusProperty = async ({
  boardId,
  propertyId,
  ...body
}: PayloadType): Promise<ISelectProperty> => {
  const uri = `/frontend/task-board/${boardId}/property/${propertyId}/status`;
  const response = await api.put<ISelectProperty>(uri, body);
  return response.data ?? [];
};

export const useEditStatusProperty = (boardId: string) => {
  const queryClient = useQueryClient()
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editStatusProperty,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getProperties", boardId] })
    }
  });

  return {
    editStatusProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
