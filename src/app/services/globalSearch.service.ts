import customFetch from '@app/utils/customFetch';
import { BASE_API } from '@app/constants/endpoints';
import { Unit } from '@entities/models/unit';

export const globalSearch = async (value: string, workspaceId?: string): Promise<Unit[]> => {
  const query = `?search=${value}`;
  const rawResponse = await customFetch(`${BASE_API}/frontend/workspace/${workspaceId}/unit-search${query}`);
  return await rawResponse.json();
};
