import React from 'react';
import { PropsWithChildren, useMemo, useState } from 'react';

import { Placement, PositioningStrategy } from '@popperjs/core';
import { createPortal } from 'react-dom';
import { usePopper as usePopperReact } from 'react-popper';

interface UsePopperProps {
  externalStyles: any;
  portalId: string;
  placement?: Placement;
  strategy?: PositioningStrategy;
  referenceElement: Element | null;
  className?: string;
}

const usePopper = ({
  externalStyles,
  portalId,
  children,
  placement = 'bottom-start',
  strategy = 'fixed',
  referenceElement,
  className,
}: PropsWithChildren<UsePopperProps>) => {
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const targetElement = document.getElementById(portalId);

  const { styles, attributes } = usePopperReact(
    referenceElement,
    popperElement,
    {
      placement,
      strategy,
    }
  );

  const popover = () =>
    targetElement
      ? createPortal(
          <div
            className={className}
            ref={setPopperElement as React.LegacyRef<HTMLDivElement>}
            {...attributes.popper}
            style={{
              ...styles.popper,
              ...externalStyles,
            }}
          >
            {children}
          </div>,
          targetElement
        )
      : null;

  return <div>{popover()}</div>;
};

export default usePopper;
