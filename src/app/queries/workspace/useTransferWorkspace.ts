import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type Params = {
  id: string;
  userId: string;
};

export const transferWorkspaceRequest = async ({ id, userId }: Params): Promise<void> => {
  await api.post(`/frontend/workspace/${id}/user/${userId}/transfer-ownership`);
};

export const useTransferWorkspace = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: transferWorkspaceRequest,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['getWorkspaces'] });
    },
  });

  return {
    mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
