export type ChannelPrivacy = 'public' | 'private';

export interface IChannel {
  id: string;
  name: string;
  privacy: ChannelPrivacy;
  byDefault: boolean;
  color: null | string;
}
