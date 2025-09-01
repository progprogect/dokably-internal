import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type Payload = {
  priceId: string;
}

export const createSubscription = async (workspaceId: string, payload: Payload): Promise<any> => {
  const uri = `/frontend/workspace/${workspaceId}/subscription`;
  const response = await api.post(uri, payload);
  return response.data ?? [];
};

export const useCreateSubscription = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: (payload: Payload) => createSubscription(workspaceId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['getSubscription'] }),
    onError: (error) => errorHandler(error),
  });

  return {
    createSubscription: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
