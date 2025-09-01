import { useMutation } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type PayloadType = {
  token: string;
};

export const createPaymentMethod = async (workspaceId: string, payload: PayloadType): Promise<any> => {
  const uri = `/frontend/workspace/${workspaceId}/payment-method`;
  const response = await api.post(uri, payload);
  return response.data ?? [];
};

export const useCreatePaymentMethod = (workspaceId: string) => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: (payload: PayloadType) => createPaymentMethod(workspaceId, payload),
    onError: (error) => errorHandler(error),
  });

  return {
    createPaymentMethod: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
