import { useQuery } from '@tanstack/react-query';

import type { WorkspaceMember } from '@app/context/workspace/types';
import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type Params = {
  id: string;
};

export const getWorkspaceGuestsRequest = async (workspaceId: string): Promise<WorkspaceMember[]> => {
  const response = await api.get<WorkspaceMember[]>(`/frontend/workspace/${workspaceId}/guest`);
  return response.data ?? [];
};

export const useGetWorkspaceGuests = ({ id }: Params) => {
  const {
    error,
    data: guests,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ['getWorkspaceGuests', id],
    queryFn: () => getWorkspaceGuestsRequest(id),
    enabled: !!id,
    initialData: [],
  });

  if (error) errorHandler(error);

  return {
    guests,
    refetch,
    isPending,
  };
};
