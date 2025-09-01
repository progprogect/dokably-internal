import { BASE_API } from '@app/constants/endpoints';
import { ChannelPrivacy, IChannel } from '@entities/models/IChannel';
import customFetch from '@app/utils/customFetch';

export const getChannels = async (workspaceId: string): Promise<IChannel[]> => {
  const rawResponse = await customFetch(`${BASE_API}/frontend/workspace/${workspaceId}/channel`);
  return await rawResponse.json();
};

export const getChannel = async (
  channelId: string,
  workspaceId: string,
  options?: { signal?: AbortSignal },
): Promise<IChannel> => {
  const rawResponse = await customFetch(`${BASE_API}/frontend/workspace/${workspaceId}/channel/${channelId}`, options);
  return await rawResponse.json();
};

export const updateChannel = async (id: string, name: string, privacy: string) => {
  const rawResponse = await customFetch(`${BASE_API}/frontend/channel/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name: name, privacy: privacy }),
  });
  return await rawResponse.json();
};

export const createChannel = async (
  workspaceId: string,
  channelName: string,
  color: string,
  privacy: ChannelPrivacy,
) => {
  const rawResponse = await customFetch(`${BASE_API}/frontend/workspace/${workspaceId}/channel`, {
    method: 'POST',
    body: JSON.stringify({
      name: channelName,
      privacy,
      color,
    }),
  });

  return await rawResponse.json();
};
