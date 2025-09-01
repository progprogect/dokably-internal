import { useQuery } from '@tanstack/react-query';

import type { Workspace } from '@app/context/workspace/types';
import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

export const getWorkspacesRequest = async (): Promise<Workspace[]> => {
  const response = await api.get<Workspace[]>('/frontend/workspace');
  return response.data ?? [];
};

export const useGetWorkspaces = () => {
  const { error, data, refetch, isPending } = useQuery({
    queryKey: ['getWorkspaces'],
    queryFn: getWorkspacesRequest,
    enabled: false,
    initialData: [],
  });

  if (error) errorHandler(error);

  return {
    data,
    refetch,
    isPending,
  };
};
