import { BASE_API } from '@app/constants/endpoints';
import customFetch from '@app/utils/customFetch';
import { toBase64 } from '@shared/lib/utils/browser/toBase64';
import {
  IUploadedFileData,
  UploadWidgetConfig,
} from '@widgets/editor/plugins/Image/types';

export async function uploadImage(
  file: File,
  workspaceId?: string,
  options?: UploadWidgetConfig,
): Promise<IUploadedFileData> {
  const raiseError = (error: Error): never => {
    throw error;
  };

  const { maxFileSizeBytes, mimeTypes } = options ?? {};
  if (maxFileSizeBytes !== undefined && file.size > maxFileSizeBytes) {
    raiseError(
      new Error(`${options?.locale?.maxSize ?? 'File size limit exceeded.'}`),
    );
  }
  if (mimeTypes !== undefined && !mimeTypes.includes(file.type)) {
    raiseError(
      new Error(
        options?.locale?.unsupportedFileType ?? 'File type not supported.',
      ),
    );
  }

  const fileString = await toBase64(file);

  try {
    const response = await customFetch(`${BASE_API}/frontend/${workspaceId}/tmp-file`, {
      method: 'POST',
      cache: 'no-cache',
      redirect: 'follow',
      body: JSON.stringify({ data: fileString }),
    });

    // Check if response is ok
    if (!response.ok) {
      if (response.status === 413) {
        raiseError(
          new Error('File size is too large. Maximum allowed size is 50 MB.')
        );
      }
      raiseError(
        new Error(`Upload failed: ${response.status} ${response.statusText}`)
      );
    }

    return response.json();
  } catch (error: any) {
    // Handle CORS errors that might indicate 413 status
    // When server returns 413 with CORS issues, the error message often contains specific patterns
    const errorMessage = error.message || '';
    const fileSizeLimit = maxFileSizeBytes || 50 * 1024 * 1024; // Default to 50MB
    const isLikelySizeError = 
      errorMessage.includes('413') || 
      errorMessage.toLowerCase().includes('payload too large') ||
      errorMessage.toLowerCase().includes('access control') ||
      (errorMessage.toLowerCase().includes('failed to fetch') && file.size > fileSizeLimit * 0.8); // If file is close to limit and fetch fails
    
    if (isLikelySizeError) {
      raiseError(
        new Error('File size is too large. Maximum allowed size is 50 MB.')
      );
    }
    
    // Re-throw other errors
    throw error;
  }
}
