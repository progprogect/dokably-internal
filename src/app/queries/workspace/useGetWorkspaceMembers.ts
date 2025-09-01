import { useQuery } from '@tanstack/react-query';

import type { WorkspaceMember } from '@app/context/workspace/types';
import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

type Params = {
  id: string;
};

export const getWorkspaceMembersRequest = async (id: string): Promise<WorkspaceMember[]> => {
  const response = await api.get<WorkspaceMember[]>(`/frontend/workspace/${id}/user`);
  return response.data ?? [];
};

export const useGetWorkspaceMembers = ({ id }: Params) => {
  const {
    error,
    data: members,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ['getWorkspaceMembers', id],
    queryFn: () => getWorkspaceMembersRequest(id),
    enabled: !!id,
    initialData: [],
  });

  if (error) errorHandler(error);

  return {
    members,
    refetch,
    isPending,
  };
};
