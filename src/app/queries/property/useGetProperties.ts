import { useQuery } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { IProperty } from '@widgets/task-board/types';

type Payload = {
  taskBoardId: string;
  enabled?: boolean;
};

const getProperties = async (taskBoardId: string): Promise<IProperty[]> => {
  const uri = `/frontend/task-board/${taskBoardId}/property`;
  const response = await api.get<IProperty[]>(uri);
  return response.data ?? [];
};

export const useGetProperties = ({ taskBoardId, enabled = true }: Payload) => {
  const {
    error,
    data: properties,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ['getProperties', taskBoardId],
    queryFn: () => getProperties(taskBoardId),
    enabled: enabled,
  });

  if (error) errorHandler(error);

  return {
    properties: properties ? properties : [],
    refetch,
    isPending,
  };
};
