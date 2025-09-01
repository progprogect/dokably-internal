import { useMutation } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { IProperty } from '@widgets/task-board/types';

type PayloadType = {
  unitId: string;
  name: string;
};

export const createDocLinksProperty = async ({
  unitId,
  name,
}: PayloadType): Promise<IProperty> => {
  const uri = `/frontend/task-board/${unitId}/doc-link`;
  const response = await api.post<IProperty>(uri, {
    name: name,
  });
  return response.data ?? [];
};

export const useCreateDocLinksProperty = () => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: createDocLinksProperty,
    onError: (error) => errorHandler(error),
  });

  return {
    createDocLinksProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
