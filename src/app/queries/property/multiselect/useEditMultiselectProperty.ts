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

export const editMultiSelectProperty = async ({
  boardId,
  propertyId,
  ...body
}: PayloadType): Promise<ISelectProperty> => {
  const uri = `/frontend/task-board/${boardId}/multiselect/${propertyId}`;
  const response = await api.put<ISelectProperty>(uri, body);
  return response.data ?? [];
};

export const useEditMultiselectProperty = (boardId: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editMultiSelectProperty,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getProperties', boardId] });
    },
  });

  return {
    editMultiselectProperty: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
