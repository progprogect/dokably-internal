import { ComponentPropsWithoutRef } from 'react';

export type ProgressIndicatorProps = ComponentPropsWithoutRef<'div'> & {
  progress: number;
  'aria-label': string;
};
