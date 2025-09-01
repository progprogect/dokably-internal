import { BASE_API } from '@app/constants/endpoints';
import customFetch from '@app/utils/customFetch';

export const checkWOrkspaceInviteLink = async (workspaceId: string, inviteId: string) => {
  const searchParams = new URLSearchParams();
  searchParams.append('inviteId', inviteId);

  return await customFetch(`${BASE_API}/frontend/workspace/${workspaceId}/join?${searchParams.toString()}`, {
    method: 'POST',
  });
};
