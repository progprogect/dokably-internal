import { BASE_API } from '@app/constants/endpoints';
import customFetch from '@app/utils/customFetch';

export const undoUnit = async (
  workspaceId: string,
  unitId: string
): Promise<Response> => {
  return await customFetch(
    `${BASE_API}/frontend/workspace/${workspaceId}/trash/${unitId}/restore`,
    { method: 'PATCH' }
  );
};

export const deleteForeverUnit = async (
  workspaceId: string,
  unitId: string
): Promise<Response> => {
  return await customFetch(
    `${BASE_API}/frontend/workspace/${workspaceId}/trash/${unitId}`,
    { method: 'DELETE' }
  );
};
