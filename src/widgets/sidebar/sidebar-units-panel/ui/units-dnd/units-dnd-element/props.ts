import { CSSProperties, PropsWithChildren } from 'react';

export type UnitsDndElementProps<U> = PropsWithChildren<{
  style?: CSSProperties;
  unit: U;
  className?: string;
  disabled?: boolean;
  readonly?: boolean;
}>;
