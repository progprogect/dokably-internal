import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Workspace } from '@app/context/workspace/types';
import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type Params = {
  id: string;
  data: Pick<Workspace, 'name'>;
};

export const editWorkspaceRequest = async ({ id, data }: Params): Promise<Workspace> => {
  const response = await api.patch<Workspace>(`/frontend/workspace/${id}`, data);

  return response.data;
};

export const useEditWorkspace = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editWorkspaceRequest,
    onError: (error) => errorHandler(error),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['getWorkspaces'] });

      if (variables.id) {
        void queryClient.invalidateQueries({ queryKey: ['getWorkspace', variables.id] });
      }
    },
  });

  return {
    mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
