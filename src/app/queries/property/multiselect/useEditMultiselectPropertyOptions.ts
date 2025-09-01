import { useMutation } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ISelectProperty } from '@widgets/task-board/types';
import { Option } from '@widgets/editor/plugins/blocks/Table/Table.types';
import { MULTISELECT_PROPERTY_TYPE } from '@widgets/task-board/constants';

type PayloadType = {
  unitId: string;
  propertyId: string;
  options?: Option[];
};

export const editMultiselectPropertyOptions = async ({
  unitId,
  propertyId,
  options,
}: PayloadType): Promise<ISelectProperty> => {
  const uri = `/frontend/task-board/${unitId}/multiselect/${propertyId}`;
  const response = await api.put<ISelectProperty>(uri, {
    name: MULTISELECT_PROPERTY_TYPE,
    options: options?.map(option => ({
      name: option.label,
      id: option.id,
      params: {
        color: option.color
      }
    })),
  });
  return response.data ?? [];
};

export const useEditMultiselectPropertyOptions = () => {
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: editMultiselectPropertyOptions,
    onError: (error) => errorHandler(error),
  });

  return {
    editMultiselectPropertyOptions: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
