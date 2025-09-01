import { CSSProperties } from 'react';

export type UnitsDndDragOverlayProps<U> = {
  isActive?: boolean;
  unit: U | null;
  className?: string;
  style?: CSSProperties;
};
