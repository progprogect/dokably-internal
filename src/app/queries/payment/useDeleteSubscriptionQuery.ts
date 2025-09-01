import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

export const deleteSubscription = async (workspaceId: string): Promise<any> => {
  const uri = `/frontend/workspace/${workspaceId}/subscription`;
  const response = await api.delete(uri);
  return response.data ?? [];
};

export const useDeleteSubscription = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: () => deleteSubscription(workspaceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['getSubscription'] }),
    onError: (error) => errorHandler(error),
  });

  return {
    deleteSubscription: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
