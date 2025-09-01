import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useCacheInvalidation() {
  const queryClient = useQueryClient();

  const invalidateTasks = useCallback(
    (boardId: string) => {
      queryClient.invalidateQueries({ queryKey: ['getTasks', boardId] });
    },
    [queryClient],
  );

  const invalidateTaskProperties = useCallback(
    (boardId: string) => {
      queryClient.invalidateQueries({ queryKey: ['getProperties', boardId] });
    },
    [queryClient],
  );

  const invalidateTaskboardConfig = useCallback(
    (boardId: string) => {
      queryClient.invalidateQueries({ queryKey: ['getTaskboardState', boardId] });
    },
    [queryClient],
  );

  return {
    invalidateTasks,
    invalidateTaskProperties,
    invalidateTaskboardConfig,
  };
}
