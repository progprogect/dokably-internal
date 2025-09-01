import { cn } from '@app/utils/cn';
import Tippy from '@tippyjs/react';
import { ComponentPropsWithRef, forwardRef, ReactNode } from 'react';

type ToolbarIconButtonProps = ComponentPropsWithRef<'button'> & {
  tooltipContent: ReactNode;
  isActive?: boolean;
};

const ToolbarIconButton = forwardRef<HTMLButtonElement, ToolbarIconButtonProps>(
  function ToolbarIconButton(
    { tooltipContent, isActive, children, className, ...props },
    ref,
  ) {
    return (
      <Tippy
        duration={0}
        content={tooltipContent}
        className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
      >
        <button
          {...props}
          ref={ref}
          className={cn(
            'flex items-center justify-center h-7 w-8 cursor-pointer hover:bg-background text-text70',
            {
              'text-primaryHover': isActive,
              'text-text70': !isActive,
            },
            className,
          )}
        >
          {children}
        </button>
      </Tippy>
    );
  },
);

export default ToolbarIconButton;
