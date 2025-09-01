import { z } from 'zod';
import { MAX_VIDEO_SIZE_MB } from '../constants/max-video-size';
import { megabytesToBytes } from '@shared/lib/utils/units/memory-units';

// Supported video MIME types
export const SUPPORTED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm', 
  'video/quicktime',
  'video/x-msvideo',
  'video/mpeg',
  'video/ogg'
] as const;

const VIDEO_MAX_SIZE_MB = MAX_VIDEO_SIZE_MB;
const VIDEO_MAX_SIZE_BYTES = megabytesToBytes(VIDEO_MAX_SIZE_MB);

const fileSizeSchema = z
  .number()
  .max(VIDEO_MAX_SIZE_BYTES, `Video file size must be less than ${VIDEO_MAX_SIZE_MB}MB`);

export function validateVideoFile(size: number, type: string): { success: boolean; error?: { issues: { message: string }[] } } {
  const sizeValidation = fileSizeSchema.safeParse(size);
  const typeValidation = SUPPORTED_VIDEO_MIME_TYPES.includes(type as any);
  
  if (!sizeValidation.success) {
    return sizeValidation;
  }
  
  if (!typeValidation) {
    return {
      success: false,
      error: {
        issues: [{
          message: `Unsupported video format. Supported formats: ${SUPPORTED_VIDEO_MIME_TYPES.join(', ')}`
        }]
      }
    };
  }
  
  return { success: true };
}

export function validateVideoFileSize(fileSizeBytes: number) {
  return fileSizeSchema.safeParse(fileSizeBytes);
}
