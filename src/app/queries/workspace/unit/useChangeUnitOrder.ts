import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type UnitOrder = {
  id: string;
  order: number;
};

type Payload = {
  workspaceId: string;
  unitpParentId?: string;
  unitOrders: UnitOrder[];
};

export const changeUnitsOrder = async ({
  workspaceId,
  unitpParentId,
  unitOrders,
}: Payload): Promise<unknown> => {
  const uri = `/frontend/workspace/${workspaceId}/unit/sort`;
  const response = await api.put<unknown>(uri, unitOrders, {
    params: { parentId: unitpParentId },
  });
  return response.data;
};

export const useChangeUnitOrder = (boardId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: changeUnitsOrder,
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getTasks', boardId] });
    },
  });

  return {
    changeUnitsOrder: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
