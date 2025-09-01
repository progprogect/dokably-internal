import { ComponentPropsWithRef } from 'react';

export type FiltType = 'pdf' | 'doc' | 'mp4' | 'webm' | 'mov' | 'avi' | 'mpeg' | 'unknown';

export type FilePreviewProps = ComponentPropsWithRef<'div'> & {
  disabled?: boolean;
  filtType: FiltType;
  fileName: string;
  progress: number;
  error?: unknown;
  showProgress?: boolean;
  onRetry?: () => void;
};
