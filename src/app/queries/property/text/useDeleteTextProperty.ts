import { useMutation } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { IProperty } from '@widgets/task-board/types';

type PayloadType = {
  propertyId: string;
};

export const deleteProperty = async ({
  propertyId,
}: PayloadType): Promise<IProperty> => {
  const uri = `/frontend/task-board/property/${propertyId}`;
  const response = await api.delete<IProperty>(uri);
  return response.data ?? [];
};

export const useDeleteTextProperty = () => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: deleteProperty,
    onError: (error) => errorHandler(error),
  });

  return {
    deleteTextProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
