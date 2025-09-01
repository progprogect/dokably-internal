import { useQuery } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ITask } from '@widgets/task-board/types';

type Payload = {
  taskBoardId: string;
  parentTaskId: string;
  enabled?: boolean;
};

const getSubTasks = async (
  taskBoardId: string,
  parentTaskId: string,
): Promise<ITask[]> => {
  const uri = `/frontend/task-board/${taskBoardId}/task?parentTaskId=${parentTaskId}`;
  const response = await api.get<ITask[]>(uri);
  return response.data ?? [];
};

export const useGetSubTasks = ({
  taskBoardId,
  parentTaskId,
  enabled = true,
}: Payload) => {
  const {
    error,
    data: tasks,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ['getSubTasks', taskBoardId, parentTaskId],
    queryFn: () => getSubTasks(taskBoardId, parentTaskId),
    enabled: enabled,
  });

  if (error) errorHandler(error);

  return {
    subtasks: tasks ? tasks : [],
    refetch,
    isPending,
  };
};
