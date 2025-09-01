import { useUploadFile } from '@app/queries/file/useUploadFile';
import { IUploadedFileData } from '@widgets/editor/plugins/Image/types';
import { useMemo, useState } from 'react';
import { FILE_TYPES_TO_EXTENSIONS_MAP } from '../constants/file-types-map';

export type UploaderFileData = {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  size: number;
  extension: 'pdf' | 'doc' | 'mp4' | 'webm' | 'mov' | 'avi' | 'mpeg';
};

type UseFileUploadingApiProps = {
  workspaceId?: string;
  onUploaded: (uploadedData: UploaderFileData) => void;
};

const getExtension = (mimeType: string) =>
  FILE_TYPES_TO_EXTENSIONS_MAP[
    mimeType as keyof typeof FILE_TYPES_TO_EXTENSIONS_MAP
  ];

const mergeFileData = (
  responseFileData: IUploadedFileData,
  file: File,
): UploaderFileData => {
  return {
    id: responseFileData.id,
    // TODO: Replace `entityData?.presignedObjectUrl` with original filename when backend is ready
    name: file.name,
    mimeType: responseFileData.mimeType,
    url: responseFileData.presignedObjectUrl,
    size: responseFileData.size,
    extension: getExtension(responseFileData.mimeType),
  };
};

export function useFileUploadingApi({ workspaceId, onUploaded }: UseFileUploadingApiProps) {
  const [file, setFile] = useState<File | null>(null);
  const { uploadFile, data, error, progress, isPending, isError } = useUploadFile(workspaceId);

  const handleUploadFile = async (file: File) => {
    setFile(file);
    const response = await uploadFile(file);
    onUploaded(mergeFileData(response.data, file));
  };

  const handleRetryUploadFile = async () => {
    if (!file) return;
    handleUploadFile(file);
  };

  const handleClearTemporaryData = () => setFile(null);

  const tmpFileData = useMemo(() => {
    if (!file) return null;
    return {
      name: file.name,
      mimeType: file.type,
      size: file.size,
      extension: getExtension(file.type),
    } as const;
  }, [file]);

  return {
    uploadFile: handleUploadFile,
    retryUploadFile: handleRetryUploadFile,
    clearTmpData: handleClearTemporaryData,
    tmpFileData: tmpFileData,
    error,
    progress,
    isPending,
    isError,
  };
}
