import { forwardRef } from 'react';
import { cn } from '@app/utils/cn';

import { IconButtonProps } from './props';
import styles from './styles.module.scss';
import ActiveElement from '@shared/uikit/active-element';

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className: propsClassName,
      children,
      type = 'button',
      size = 'xs',
      variant = 'filled',
      active,
      ...props
    },
    ref,
  ) => {
    return (
      <ActiveElement
        variant={variant}
        size={size}
        active={active}
        isIcon
      >
        {({ className }) => (
          <button
            {...props}
            type={type}
            className={cn(
              'transition select-none',
              styles['icon-button'],
              className,
              propsClassName,
            )}
            ref={ref}
          >
            {children}
          </button>
        )}
      </ActiveElement>
    );
  },
);

export default IconButton;
