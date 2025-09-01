import { useMutation } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

export const deletePaymentMethod = async (workspaceId: string): Promise<any> => {
  const uri = `/frontend/workspace/${workspaceId}/payment-method`;
  const response = await api.delete(uri);
  return response.data ?? [];
};

export const useDeletePaymentMethod = (workspaceId: string) => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: () => deletePaymentMethod(workspaceId),
    onError: (error) => errorHandler(error),
  });

  return {
    deletePaymentMethod: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
