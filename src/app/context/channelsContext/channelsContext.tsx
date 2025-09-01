import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { createChannel, getChannels } from '@app/services/channel.service';
import { ChannelPrivacy, IChannel } from '@entities/models/IChannel';

import { useWorkspaceContext } from '../workspace/context';

const generateColor = () => {
  const hue = Math.floor(Math.random() * 359);
  return `hsl(${hue},50%,75%)`;
};

type CreateNewChannel = (workspaceId: string, channelName: string, privacy: ChannelPrivacy) => Promise<IChannel>;

export type ChannelsContextValueType = {
  channels: IChannel[];
  didChannelsLoaded: boolean;
  defaultChannel: IChannel | null;
  createNewChannel: CreateNewChannel;
};

const ChannelsContext = createContext<ChannelsContextValueType>({
  channels: [],
  didChannelsLoaded: false,
  defaultChannel: null,
  createNewChannel: async () => {},
} as unknown as ChannelsContextValueType);

export const ChannelsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { activeWorkspace } = useWorkspaceContext();
  const [didChannelsLoaded, setDidChannelsLoaded] = useState(false);
  const [channels, setChannels] = useState<IChannel[]>([]);
  const [defaultChannel, setDefaultChannel] = useState<IChannel | null>(null);
  const [privateChannelCreationAttempted, setPrivateChannelCreationAttempted] = useState(false);

  const createNewChannel: CreateNewChannel = useCallback((workspaceId, channelName, privacy) => {
    const color = generateColor();
    return createChannel(workspaceId, channelName, color, privacy);
  }, []);

  const getPrivateChannel = useCallback((channels: IChannel[]) => {
    return channels.find((channel) => channel.name.toLowerCase() === 'private');
  }, []);

  const getDefaultChannel = useCallback(
    (channels: IChannel[]) => {
      if (channels.length === 0) {
        return null;
      }

      return channels.find((channel) => channel.byDefault) || getPrivateChannel(channels) || channels[0];
    },
    [getPrivateChannel],
  );

  const loadChannels = useCallback(
    async (workspaceId: string) => {
      if (!workspaceId) {
        return;
      }

      setDidChannelsLoaded(false);

      const loadedChannels = await getChannels(workspaceId);
      const defChannel = getDefaultChannel(loadedChannels);

      setDefaultChannel(defChannel);
      setChannels(loadedChannels);
      setDidChannelsLoaded(true);
    },
    [getDefaultChannel],
  );

  useEffect(() => {
    if (!activeWorkspace?.id) {
      return;
    }

    void loadChannels(activeWorkspace?.id);
  }, [loadChannels, activeWorkspace?.id]);

  useEffect(() => {
    if (!didChannelsLoaded) return;

    const createPrivateChannelForMemberIfNeeded = async () => {
      if (!activeWorkspace?.id) return;
      if (privateChannelCreationAttempted) return;

      const userRole = activeWorkspace.userRole;
      if (!userRole || userRole !== 'member') return;

      const privateChannel = getPrivateChannel(channels);
      if (privateChannel) {
        setPrivateChannelCreationAttempted(true);
        return;
      }

      try {
        const newChannel = await createNewChannel(activeWorkspace.id, 'Private', 'private');

        if (!newChannel || !newChannel.id) {
          throw new Error('Failed to create private channel');
        }

        setChannels((prev) => (prev.some((ch) => ch.id === newChannel.id) ? prev : [...prev, newChannel]));
        setDefaultChannel(getDefaultChannel([...channels, newChannel]));
      } catch (error) {
        console.error('Error during one-time private channel creation attempt:', error);
      } finally {
        setPrivateChannelCreationAttempted(true);
      }
    };

    void createPrivateChannelForMemberIfNeeded();
  }, [didChannelsLoaded, channels, activeWorkspace?.userRole, activeWorkspace?.id, privateChannelCreationAttempted]);

  const contextValue = useMemo(
    () => ({ channels, didChannelsLoaded, defaultChannel, createNewChannel }),
    [channels, didChannelsLoaded, defaultChannel, createNewChannel],
  );

  return <ChannelsContext.Provider value={contextValue}>{children}</ChannelsContext.Provider>;
};

export const useChannelsContext = () => {
  const context = useContext(ChannelsContext);

  if (typeof context === undefined) {
    throw new Error('useChannelsContext must be used within ChannelsContextProvider');
  }

  return context;
};
