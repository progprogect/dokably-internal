import { ComponentPropsWithRef } from 'react';

export type FiltType = 'pdf' | 'doc' | 'unknown';

export type FilePreviewProps = ComponentPropsWithRef<'div'> & {
  disabled?: boolean;
  filtType: FiltType;
  fileName: string;
  progress: number;
  error?: unknown;
  showProgress?: boolean;
  onRetry?: () => void;
};
