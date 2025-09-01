import Tippy from '@tippyjs/react';
import { TooltipProps } from './props';
import { cn } from '@app/utils/cn';
import 'tippy.js/animations/scale.css';
import { forwardRef } from 'react';
import styles from './styles.module.scss';

const Tooltip = forwardRef<HTMLElement, TooltipProps>(
  (
    { className, children, variant = 'default', ...props }: TooltipProps,
    ref,
  ) => {
    return (
      <Tippy
        {...props}
        ref={ref}
        animation='scale'
        className={cn(
          styles['tooltip'],
          {
            [styles['tooltip__default']]: variant === 'default',
            [styles['tooltip__light']]: variant === 'light',
          },
          className,
        )}
      >
        {children}
      </Tippy>
    );
  },
);

export default Tooltip;
