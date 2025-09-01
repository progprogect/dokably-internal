import { ComponentProps } from 'react';
import ActiveElement from '@shared/uikit/active-element';

export type IconButtonProps = Omit<ComponentProps<'button'>, 'aria-label'> & {
  'aria-label': string;
} & Pick<ComponentProps<typeof ActiveElement>, 'size' | 'variant' | 'active'>;
