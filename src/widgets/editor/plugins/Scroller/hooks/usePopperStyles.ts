import IsVisible from '@entities/models/IsVisible';
import { useMemo } from 'react';

const usePopperStyles = (isVisible: IsVisible | null) =>
  useMemo(
    () =>
      isVisible
        ? {
            zIndex: 101,
            pointerEvents: 'auto',
          }
        : {
            display: 'none',
          },
    [isVisible],
  );

export default usePopperStyles;
