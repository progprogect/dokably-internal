import { BASE_API } from '@app/constants/endpoints';
import customFetch from '@app/utils/customFetch';

export const checkLink = async (unitId: string, inviteId: string) => {
  const searchParams = new URLSearchParams();
  searchParams.append('inviteId', inviteId);
  return await customFetch(
    `${BASE_API}/frontend/unit/${unitId}/join?${searchParams.toString()}`,
    {
      method: 'POST',
    }
  );
};
