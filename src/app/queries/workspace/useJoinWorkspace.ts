import { useMutation } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type Params = {
  id: string;
  inviteId: string;
};

export const joinWorkspaceRequest = async ({ id, ...data }: Params): Promise<void> => {
  await api.post(`/frontend/workspace/${id}/join`, {}, { params: data });
};

export const useJoinWorkspace = () => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: joinWorkspaceRequest,
    onError: (error) => errorHandler(error),
  });

  return {
    mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
