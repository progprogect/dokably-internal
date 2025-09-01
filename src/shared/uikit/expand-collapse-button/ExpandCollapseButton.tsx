import { forwardRef } from 'react';
import { ReactComponent as ArrowDown } from '@images/arrowDownSmall.svg';

import { CollapseButtonProps } from './props';
import { cn } from '@app/utils/cn';

const ExpandCollapseButton = forwardRef<HTMLButtonElement, CollapseButtonProps>(
  function ExpandCollapseButton(
    { onClick, className, isExpanded, ...props },
    ref,
  ) {
    return (
      <button
        aria-expanded={isExpanded}
        className={cn(
          'w-4 h-4 flex shrink-0 items-center justify-center rounded-md',
          isExpanded ? 'rotate-0' : '-rotate-90',
          className,
        )}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        <ArrowDown />
      </button>
    );
  },
);

export default ExpandCollapseButton;
