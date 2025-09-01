import { useMutation } from '@tanstack/react-query';

import type { Role } from '@entities/models/role';
import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type Params = {
  id: string;
  role: Role;
};

export const createWorkspaceInviteLinkRequest = async ({ id, ...data }: Params): Promise<string> => {
  const response = await api.post<{ link: string }>(`/frontend/workspace/${id}/invite-link`, data);

  return response.data?.link || '';
};

export const useCreateWorkspaceInviteLink = () => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: createWorkspaceInviteLinkRequest,
    onError: (error) => errorHandler(error),
  });

  return {
    mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
