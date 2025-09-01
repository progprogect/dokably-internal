import { useQuery } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ITask } from '@widgets/task-board/types';

type Payload = {
  taskId: string;
  enabled?: boolean;
};

const getTask = async (taskId: string): Promise<ITask> => {
  const uri = `/frontend/task-board/task/${taskId}`;
  const response = await api.get<ITask>(uri);
  return response.data ?? [];
};

export const useGetTask = ({ taskId, enabled = true }: Payload) => {
  const {
    error,
    data: task,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ['getTask', taskId],
    queryFn: () => getTask(taskId),
    enabled: enabled,
  });

  if (error) errorHandler(error);

  return {
    task,
    refetch,
    isPending,
  };
};
