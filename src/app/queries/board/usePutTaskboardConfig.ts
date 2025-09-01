import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { IProperty } from '@widgets/task-board/types';

type PayloadType = {
  taskboardId: string;
  data: any;
};

export const editTaskboardConfig = async ({
  taskboardId,
	data,
}: PayloadType): Promise<IProperty> => {
  const uri = `/frontend/task-board/${taskboardId}/state`;
  const response = await api.put(uri, {
    data: data,
  });
  return response.data ?? [];
};

export const usePutTaskboardConfig = (taskboardId: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: (data: any[]) => editTaskboardConfig({ taskboardId, data }),
    onError: (error) => errorHandler(error),
    onSuccess: () => {
      taskboardId &&
        queryClient.invalidateQueries({ queryKey: ['getTaskboardState', taskboardId] });
    },
  });

  return {
    editTaskboardConfig: mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
