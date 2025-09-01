import { forwardRef } from 'react';
import { cn } from '@app/utils/cn';

import { LinkButtonProps } from './props';
import styles from './styles.module.scss';
import ActiveElement from '@shared/uikit/active-element';

const IconLink = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      className: propsClassName,
      children,
      type = 'button',
      size = 'xs',
      variant = 'filled',
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <ActiveElement
        variant={variant}
        size={size}
        isIcon
        disabled={disabled}
      >
        {({ className }) => (
          <a
            {...props}
            type='button'
            className={cn(
              'transition select-none',
              styles['icon-link'],
              className,
              propsClassName,
            )}
            ref={ref}
          >
            {children}
          </a>
        )}
      </ActiveElement>
    );
  },
);

export default IconLink;
