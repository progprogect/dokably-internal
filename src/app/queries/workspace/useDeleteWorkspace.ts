import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

export const deleteWorkspaceRequest = async (id: string): Promise<void> => {
  await api.delete(`/frontend/workspace/${id}`);
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: deleteWorkspaceRequest,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['getWorkspaces'] });
    },
  });

  return {
    isPending,
    isSuccess,
    mutateAsync,
  };
};
