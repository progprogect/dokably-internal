import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type Params = {
  id: string;
  userId: string;
};

export const deleteWorkspaceUserRequest = async ({ id, userId }: Params): Promise<void> => {
  await api.delete(`/frontend/workspace/${id}/user/${userId}`);
};

export const useDeleteWorkspaceUser = ({ id }: Params) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: deleteWorkspaceUserRequest,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['getWorkspaceMembers', id] });
      void queryClient.invalidateQueries({ queryKey: ['getWorkspaceGuests', id] });
    },
  });

  return {
    isPending,
    isSuccess,
    mutateAsync,
  };
};
