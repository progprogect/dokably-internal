import { z } from 'zod';
import { MAX_FILE_SIZE_MB, MAX_VIDEO_FILE_SIZE_MB } from '../constants/max-file-size';
import { megabytesToBytes } from '@shared/lib/utils/units/memory-units';

// Supported video MIME types
export const SUPPORTED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm', 
  'video/quicktime',
  'video/x-msvideo',
  'video/mpeg'
] as const;

const VIDEO_MAX_SIZE_MB = MAX_VIDEO_FILE_SIZE_MB;

// Check if file is video
export const isVideoFile = (mimeType: string): boolean => {
  return SUPPORTED_VIDEO_MIME_TYPES.includes(mimeType as typeof SUPPORTED_VIDEO_MIME_TYPES[number]);
};

const fileValidationSchema = z.object({
  size: z
    .number()
    .max(
      megabytesToBytes(MAX_FILE_SIZE_MB),
      `Size must be less than ${MAX_FILE_SIZE_MB}Mb`,
    ),
});

const videoValidationSchema = z.object({
  size: z
    .number()
    .max(
      megabytesToBytes(VIDEO_MAX_SIZE_MB),
      `Video size must be less than ${VIDEO_MAX_SIZE_MB}MB`,
    ),
  type: z.string().refine(
    (val) => SUPPORTED_VIDEO_MIME_TYPES.includes(val as typeof SUPPORTED_VIDEO_MIME_TYPES[number]),
    'Unsupported video format. Please use MP4, WebM, QuickTime, AVI, or MPEG.'
  ),
});

export function validateFileSzie(fileSizeBytes: number) {
  return fileValidationSchema.safeParse({ size: fileSizeBytes });
}

export function validateVideoFile(size: number, type: string) {
  return videoValidationSchema.safeParse({ size, type });
}

export function validateFile(file: File) {
  // Check if file is video and validate accordingly
  if (isVideoFile(file.type)) {
    return validateVideoFile(file.size, file.type);
  } else {
    // For non-video files, validate size only
    return validateFileSzie(file.size);
  }
}

// Helper function to get file type for FilePreview
export function getFileType(mimeType: string, extension: string): 'pdf' | 'doc' | 'video' | 'unknown' {
  if (isVideoFile(mimeType)) {
    return 'video';
  }
  
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return 'pdf';
  }
  
  if (
    mimeType.includes('document') || 
    mimeType.includes('text') || 
    ['doc', 'docx', 'txt', 'csv', 'xls', 'xlsx'].includes(extension)
  ) {
    return 'doc';
  }
  
  return 'unknown';
}
