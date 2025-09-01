import { useMutation } from '@tanstack/react-query';

import { errorHandler } from '@app/utils/errorHandler';
import { AxiosProgressEvent, AxiosResponse } from 'axios';
import { api } from '@app/utils/api';
import { useCallback, useEffect, useState } from 'react';

export async function downloadFile(
  url: string,
  options?: {
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void;
  },
): Promise<AxiosResponse<Blob>> {
  return await api.get(url, { responseType: 'blob', ...options });
}

const INITIAL_PROGRESS_STATE = {
  progress: 0,
};

export const useDownloadFile = () => {
  const [progress, setProgress] = useState<{ progress: number }>(
    INITIAL_PROGRESS_STATE,
  );

  const onDownloadProgress = useCallback(
    (uploadingEvent: AxiosProgressEvent) => {
      const progress = uploadingEvent.progress;
      if (progress) setProgress({ progress: Math.round(progress * 100) });
    },
    [],
  );

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (url: string) => {
      return await downloadFile(url, { onDownloadProgress });
    },
    mutationKey: ['downloadFile'],
    onError: errorHandler,
  });

  useEffect(() => {
    if (error) setProgress(INITIAL_PROGRESS_STATE);
  }, [error]);

  return {
    progress,
    error,
    isPending,
    downloadFile: mutateAsync,
  };
};
