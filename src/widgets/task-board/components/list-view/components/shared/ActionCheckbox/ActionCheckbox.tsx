import { cn } from '@app/utils/cn';
import { ComponentPropsWithRef, forwardRef, ReactElement } from 'react';
import styles from './styles.module.scss';

const ActionCheckbox = forwardRef<
  HTMLInputElement,
  Omit<ComponentPropsWithRef<'input'>, 'type'> & {
    $icon: ReactElement;
  }
>(function ActionCheckbox({ children, className, $icon, ...props }, ref) {
  return (
    <label
      className={cn(
        'flex gap-2 p-2 items-center rounded-lg focus:bg-background hover:bg-background hover:text-text text-text70 w-full',
        className,
        styles.actionCheckboxLabel
      )}
    >
      {$icon}
      {children}
      <input
        className={cn('ml-auto', styles.checkbox)}
        ref={ref}
        type='checkbox'
        {...props}
      />
    </label>
  );
});

export default ActionCheckbox;
