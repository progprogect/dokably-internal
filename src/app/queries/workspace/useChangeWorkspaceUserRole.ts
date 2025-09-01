import { useMutation } from '@tanstack/react-query';

import type { Role } from '@entities/models/role';
import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type Params = {
  id: string;
  userId: string;
  role: Role;
};

export const changeWorkspaceUserRoleRequest = async ({ id, userId, role }: Params): Promise<void> => {
  await api.patch(`/frontend/workspace/${id}/user/${userId}`, { role });
};

export const useDeleteWorkspaceUser = ({ id }: Params) => {
  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: changeWorkspaceUserRoleRequest,
    onError: (error) => errorHandler(error),
  });

  return {
    isPending,
    isSuccess,
    mutateAsync,
  };
};
