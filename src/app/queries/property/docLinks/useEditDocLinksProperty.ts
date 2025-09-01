import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Option } from '@widgets/editor/plugins/blocks/Table/Table.types';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ISelectProperty } from '@widgets/task-board/types';

type PayloadType = {
  boardId: string;
  propertyId: string;
  options: Option[];
  name: string;
};

export const editProperty = async ({ boardId, propertyId, ...body }: PayloadType): Promise<ISelectProperty> => {
  const uri = `/frontend/task-board/${boardId}/doc-link/${propertyId}`;
  const response = await api.put<ISelectProperty>(uri, body);
  return response.data ?? [];
};

export const useEditDocLinksProperty = (boardId: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editProperty,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getProperties', boardId] });
    },
  });

  return {
    editDoclinksProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
