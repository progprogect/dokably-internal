import { BASE_API } from '@app/constants/endpoints';
import customFetch from '@app/utils/customFetch';

export const getUserInfo = async () => {
  const rawResponse = await customFetch(`${BASE_API}/frontend/user/info`);
  return await rawResponse.json();
};
