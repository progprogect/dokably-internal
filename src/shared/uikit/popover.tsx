import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@app/utils/cn';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    autoFocusContent?: boolean;
    portal?: boolean;
  }
>(
  (
    {
      className,
      align = 'center',
      sideOffset = 4,
      autoFocusContent = false,
      portal,
      onOpenAutoFocus,
      ...props
    },
    ref,
  ) => {
    const handleContentAutoFocus = (event: Event) => {
      if (autoFocusContent) {
        event.preventDefault();
        if (event.target instanceof HTMLElement) event.target.focus();
      }
      onOpenAutoFocus?.(event);
    };

    const content = (
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        onOpenAutoFocus={handleContentAutoFocus}
        className={cn('z-[31] rounded-md bg-popover shadow-md', className)}
        {...props}
      />
    );

    if (!portal) return content;

    return <PopoverPrimitive.Portal>{content}</PopoverPrimitive.Portal>;
  },
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
