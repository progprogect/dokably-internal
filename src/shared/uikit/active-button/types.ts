import { ComponentProps, ReactElement, ReactNode } from 'react';

export type ActiveButtonProps = ComponentProps<'button'> & {
  leftSection?: ReactNode;
};
