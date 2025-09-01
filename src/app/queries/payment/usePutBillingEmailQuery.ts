import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type PayloadType = {
  workspaceId: string;
  email: string;
};

export const updateBillingEmail = async ({
  workspaceId,
	email,
}: PayloadType): Promise<any> => {
  const uri = `/frontend/workspace/${workspaceId}/billing-email`;
  const response = await api.put(uri, {
    email,
  });
  return response.data ?? [];
};

export const usePutBillingEmail = (workspaceId: string) => {
  // const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: (email: string) => updateBillingEmail({ workspaceId, email }),
    onError: (error) => errorHandler(error),
    // onSuccess: () => {
    //   taskboardId &&
    //     queryClient.invalidateQueries({ queryKey: ['getTaskboardState', taskboardId] });
    // },
  });

  return {
    updateBillingEmail: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
