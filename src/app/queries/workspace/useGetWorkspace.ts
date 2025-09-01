import { useQuery } from '@tanstack/react-query';

import type { Workspace } from '@app/context/workspace/types';
import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

export const getWorkspaceRequest = async (id: string): Promise<Workspace> => {
  const response = await api.get<Workspace>(`/frontend/workspace/${id}`);
  return response.data;
};

export const useGetWorkspaces = (id: string) => {
  const { error, data, refetch, isPending } = useQuery({
    queryKey: ['getWorkspace', id],
    queryFn: () => getWorkspaceRequest(id),
    enabled: !!id,
  });

  if (error) errorHandler(error);

  return {
    data,
    refetch,
    isPending,
  };
};
