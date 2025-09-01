import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ISelectProperty } from '@widgets/task-board/types';

type PayloadType = {
  propertyId: string;
  name: string;
};

export const renameProperty = async ({ propertyId, ...body }: PayloadType): Promise<ISelectProperty> => {
  const uri = `/frontend/task-board/property/${propertyId}/rename`;
  const response = await api.patch<ISelectProperty>(uri, body);
  return response.data ?? [];
};

export const useRenameProperty = (boardId: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: renameProperty,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['getProperties', boardId] });
    },
  });

  return {
    renameProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
