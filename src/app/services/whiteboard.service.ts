import { track } from '@amplitude/analytics-browser';
import { BASE_API } from '@app/constants/endpoints';
import { IDocument } from '@entities/models/IDocument';
import { Unit } from '@entities/models/unit';
import customFetch from '@app/utils/customFetch';

export const createWhiteboard = async (
  parrentId: string,
  whiteboardId: string,
  whiteboardName?: string
): Promise<Unit | null> => {
  const rawResponse = await customFetch(`${BASE_API}/frontend/whiteboard`, {
    method: 'POST',
    body: JSON.stringify({
      unitId: parrentId,
      id: whiteboardId,
      name: whiteboardName || 'Untitled',
    }),
  });
  if (rawResponse.ok) {
    track('whiteboard_create_action');
  }
  return await rawResponse.json();
};

export const saveWhiteboard = async ({
  snapshot,
  id,
}: {
  snapshot: any;
  id: string;
}) => {
  const dataString = JSON.stringify(snapshot);

  await customFetch(`${BASE_API}/frontend/whiteboard/${id}/state`, {
    method: 'PUT',
    body: JSON.stringify({
      data: { dataString },
    }),
  });
};

export const getWhiteboard = async (documentId: string): Promise<IDocument> => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/whiteboard/${documentId}`
  );
  return await rawResponse.json();
};
