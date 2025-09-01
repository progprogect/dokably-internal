import { cn } from '@app/utils/cn';
import { ComponentPropsWithRef, forwardRef, ReactElement } from 'react';

const ActionButton = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithRef<'button'>, 'name'> & {
    $icon?: ReactElement | null;
    $iconEnd?: ReactElement | null;
    name: string;
  }
>(function ActionButton(
  { children, className, $icon, type = 'button', $iconEnd, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'flex rounded-lg hover:bg-background hover:text-text focus:text-text focus:bg-background text-sm gap-2 items-center text-text70 w-full',
        className,
      )}
      {...props}
    >
      {$icon}
      {children}
      <div className='ml-auto'>{$iconEnd}</div>
    </button>
  );
});

export default ActionButton;
