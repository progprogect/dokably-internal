import { IChannel } from '@entities/models/IChannel';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

type QueryProps = {
  unitId: string | undefined;
  workspaceId: string | undefined;
};

type QueryResponse = IChannel | null;

type QueryFetcher = (
  unitId: string,
  documentId: string,
  options?: { signal?: AbortSignal },
) => Promise<QueryResponse>;

type QueryOptions = { enabled?: boolean };

const getQueryKey = (props: QueryProps): string[] => {
  const key = ['channel'];
  if (!_.isNil(props.workspaceId)) key.push(props.workspaceId);
  if (!_.isNil(props.unitId)) key.push(props.unitId);
  return key;
};

export const useGetChannelQuery = (
  props: QueryProps,
  fetcher: QueryFetcher,
  options?: QueryOptions,
) => {
  const query = useQuery<QueryResponse, Error, QueryResponse, string[]>({
    queryKey: getQueryKey(props),
    queryFn: (options) => {
      if (!props.unitId || !props.workspaceId) return null;
      return fetcher(props.unitId, props.workspaceId, options);
    },
    enabled: options?.enabled,
  });

  return query;
};
