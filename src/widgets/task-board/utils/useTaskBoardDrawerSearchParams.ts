import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type TaskBoardDrawerSearchParams = { task: string; board: string, isSubtask: string };

export function useTaskBoardDrawerSearchParams() {
  const [_searchParams, _setSearchParams] = useSearchParams();

  const setSearchParams = useCallback(
    ({ task, board }: TaskBoardDrawerSearchParams) => {
      _setSearchParams({ task, board });
    },
    [_setSearchParams],
  );

  const deleteSearchParams = useCallback(
    (params: Array<keyof TaskBoardDrawerSearchParams>) => {
      _setSearchParams((prev: URLSearchParams) => {
        const newParams = new URLSearchParams(prev);
        params.forEach((key) => newParams.delete(key));
        return newParams;
      });
    },
    [_setSearchParams],
  );

  const searchParams = useMemo(
    () => ({
      task: _searchParams.get('task'),
      board: _searchParams.get('board'),
    }),
    [_searchParams],
  );

  return [searchParams, setSearchParams, { deleteSearchParams }] as const;
}
