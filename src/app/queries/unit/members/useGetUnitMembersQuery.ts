import { Unit } from '@entities/models/unit';
import { WorkspaceMembersForUnit } from '@entities/models/workspace';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

type QueryProps = {
  unitId: string | undefined;
};

type QueryFetcher = (
  unitId: string,
  options?: { signal?: AbortSignal },
) => Promise<WorkspaceMembersForUnit>;

type QueryOptions<Result> = {
  enabled?: boolean;
  select?: (data: UnitResponse) => Result;
};
type UnitResponse = WorkspaceMembersForUnit | null;

const queryKey = (props: QueryProps): string[] => {
  const key = ['unit_members'];
  if (!_.isNil(props.unitId)) key.push(props.unitId);
  return key;
};

export const useGetUnitMembersQuery = <Result = UnitResponse>(
  props: QueryProps,
  fetcher: QueryFetcher,
  options?: QueryOptions<Result>,
) => {
  const query = useQuery<UnitResponse, Error, Result, string[]>({
    queryKey: queryKey(props),
    queryFn: (options) => {
      if (!props.unitId) return null;
      return fetcher(props.unitId, options);
    },
    enabled: options?.enabled,
    select: options?.select,
  });

  return query;
};
