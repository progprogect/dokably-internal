import { useQuery } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { ITask } from '@widgets/task-board/types';
import { DATE_PROPERTY_TYPE } from '@widgets/task-board/constants';
import { unixSecondsToDate } from '@shared/lib/utils/date/unix-seconds-to-date';
import { useCallback } from 'react';

type Payload = {
  taskBoardId: string;
  enabled?: boolean;
};

const getTasks = async (taskBoardId: string): Promise<ITask[]> => {
  const uri = `/frontend/task-board/${taskBoardId}/task?limit=100`;
  const response = await api.get<ITask[]>(uri);
  return response.data ?? [];
};

const emptyArray: ITask[] = [];

const select = (data: ITask[]): ITask[] => {
  return data
    .map((task) => ({
      ...task,
      properties: task.properties.map((property) => {
        return property.type === DATE_PROPERTY_TYPE && property.value
          ? { ...property, value: unixSecondsToDate(property.value) }
          : property;
      }),
    }))
    .sort((taskA, taskB) => taskA.order - taskB.order);
};

export const useGetTasks = ({ taskBoardId, enabled = true }: Payload) => {
  const queryFn = useCallback(() => getTasks(taskBoardId), [taskBoardId]);
  const {
    error,
    data: tasks,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ['getTasks', taskBoardId],
    queryFn,
    enabled: enabled,
    select,
  });

  if (error) errorHandler(error);

  return {
    tasks: tasks ? tasks : emptyArray,
    refetch,
    isPending,
  };
};
