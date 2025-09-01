import { ReactElement } from 'react';

export type ElementSize = 'l' | 'm' | 's' | 'xs';
export type ElementVariant = 'transparent' | 'filled' | 'active' | 'error';

export type ActiveElementProps = {
  isIcon?: boolean;
  variant?: ElementVariant;
  size?: ElementSize;
  className?: string;
  disabled?: boolean;
  active?: boolean;
  children: (props: { className: string }) => ReactElement;
};
