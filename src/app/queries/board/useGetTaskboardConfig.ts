import { useQuery } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type Payload = {
  taskBoardId: string;
  enabled?: boolean;
};

const getConfig = async (taskBoardId: string): Promise<any> => {
  const uri = `/frontend/task-board/${taskBoardId}/state`;
  const response = await api.get(uri);
  return response.data ?? [];
};

export const useGetTaskboardState = ({ taskBoardId, enabled = true }: Payload) => {
  const {
    error,
    data: data,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ['getTaskboardState', taskBoardId],
    queryFn: () => getConfig(taskBoardId),
    enabled: enabled,
  });

  if (error) errorHandler(error);

  return {
    data: data ? data : [],
    refetch,
    isPending,
  };
};
