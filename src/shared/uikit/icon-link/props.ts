import { ComponentProps } from 'react';
import ActiveElement from '@shared/uikit/active-element';

export type LinkButtonProps = Omit<ComponentProps<'a'>, 'aria-label'> & {
  'aria-label': string;
} & Pick<ComponentProps<typeof ActiveElement>, 'size' | 'variant'> & {
    disabled?: boolean;
  };
