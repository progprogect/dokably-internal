import { useMutation, useQueryClient } from "@tanstack/react-query"


import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

const deleteProperty = async (propertyId: string): Promise<any> => {
  const uri = `/frontend/task-board/property/${propertyId}`;
  const response = await api.delete(uri);
  return response.data ?? [];
}

export const useDeleteProperty = (boardId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: deleteProperty,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      boardId &&
        queryClient.invalidateQueries({ queryKey: ['getProperties', boardId] });
    },
  });

  return {
    isPending,
    isSuccess,
    deleteProperty: mutateAsync
  }
}
