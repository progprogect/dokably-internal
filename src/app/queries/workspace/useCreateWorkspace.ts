import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Workspace } from '@app/context/workspace/types';
import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type Params = {
  name: string;
};

export const createWorkspaceRequest = async ({ name }: Params): Promise<Workspace> => {
  const response = await api.post<Workspace>('/frontend/workspace', {
    name,
  });

  return response.data;
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: createWorkspaceRequest,
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
