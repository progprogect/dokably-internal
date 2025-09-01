import { Unit } from '@entities/models/unit';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

type QueryProps = {
  unitId: string | undefined;
  workspaceId: string | undefined;
};

type QueryFetcher = (
  unitId: string,
  documentId: string,
  options?: { signal?: AbortSignal },
) => Promise<Unit | null>;

type QueryOptions = { enabled?: boolean };
type UnitResponse = Unit | null;

const getUnitQueryKey = (props: QueryProps): string[] => {
  const key = ['unit'];
  if (!_.isNil(props.workspaceId)) key.push(props.workspaceId);
  if (!_.isNil(props.unitId)) key.push(props.unitId);
  return key;
};

export const useGetUnitQuery = (
  props: QueryProps,
  fetcher: QueryFetcher,
  options?: QueryOptions,
) => {
  const query = useQuery<UnitResponse, Error, UnitResponse, string[]>({
    queryKey: getUnitQueryKey(props),
    queryFn: (options) => {
      if (!props.unitId || !props.workspaceId) return null;
      return fetcher(props.unitId, props.workspaceId, options);
    },
    enabled: options?.enabled,
  });

  return query;
};
