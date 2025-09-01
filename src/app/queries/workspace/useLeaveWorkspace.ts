import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

export const leaveWorkspaceRequest = async (id: string): Promise<void> => {
  await api.delete(`/frontend/user/workspace/${id}`);
};

export const useLeaveWorkspace = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: leaveWorkspaceRequest,
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
