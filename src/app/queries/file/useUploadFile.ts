import { useMutation } from '@tanstack/react-query';

import { errorHandler } from '@app/utils/errorHandler';
import { toBase64 } from '@shared/lib/utils/browser/toBase64';
import { AxiosProgressEvent, AxiosResponse } from 'axios';
import { api } from '@app/utils/api';
import { BASE_API } from '@app/constants/endpoints';
import { useCallback, useEffect, useState } from 'react';
import { IUploadedFileData } from '@widgets/editor/plugins/Image/types';

export async function uploadFile(
  file: Blob,
  options?: { onUploadProgress?: (progressEvent: AxiosProgressEvent) => void },
  workspaceId?: string,
): Promise<AxiosResponse<IUploadedFileData>> {
  const fileName = file?.name || "file";
  const fileString = await toBase64(file);
  return await api.post(
    `${BASE_API}/frontend/${workspaceId}/tmp-file`,
    { name: fileName, data: fileString },
    options,
  );
}

const INITIAL_PROGRESS_STATE = {
  progress: 0,
};

export const useUploadFile = (workspaceId?: string) => {
  const [progress, setProgress] = useState<{ progress: number }>(
    INITIAL_PROGRESS_STATE,
  );

  const onUploadProgress = useCallback((uploadingEvent: AxiosProgressEvent) => {
    const progress = uploadingEvent.progress;
    if (progress) setProgress({ progress: Math.round(progress * 100) });
  }, []);

  const { mutateAsync, isPending, error, data, isError } = useMutation({
    mutationFn: async (file: Blob) => {
      return await uploadFile(file, { onUploadProgress }, workspaceId);
    },
    mutationKey: ['uploadFile'],
    onError: errorHandler,
  });

  useEffect(() => {
    if (error) setProgress(INITIAL_PROGRESS_STATE);
  }, [error]);

  return {
    data,
    progress,
    error,
    isPending,
    isError,
    uploadFile: mutateAsync,
  };
};
