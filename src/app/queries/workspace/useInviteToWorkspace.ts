import { useMutation } from '@tanstack/react-query';

import type { Role } from '@entities/models/role';
import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type Params = {
  id: string;
  role: Role;
  emails: string[];
};

export const inviteToWorkspaceRequest = async ({ id, ...data }: Params): Promise<void> => {
  await api.post(`/frontend/workspace/${id}/invite`, data);
};

export const useInviteToWorkspace = () => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: inviteToWorkspaceRequest,
    onError: (error) => errorHandler(error),
  });

  return {
    mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
