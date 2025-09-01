import { ReactComponent as DragNDropIcon } from '@images/drag-n-drop-icon.svg';
import { WithDndHandlerProps } from './props';
import { cn } from '@app/utils/cn';
import styles from './styles.module.scss';
import { ForwardedRef, forwardRef } from 'react';

const WithDndHandler = forwardRef<HTMLDivElement, WithDndHandlerProps>(
  function WithDndHandler(
    {
      className,
      children,
      style,
      handlerVisibility = 'default',
      handlerProps,
      ...props
    }: WithDndHandlerProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    return (
      <div
        {...props}
        ref={ref}
        style={style}
        className={cn(styles['dnd-element'], className)}
      >
        <div className='relative'>
          <button
            aria-label='Drag element to change its order'
            className={cn(
              'absolute -left-5 top-1/2 -translate-y-2/4 w-5 h-5 cursor-grab transition z-[1]',
              styles.handler,
              styles[handlerVisibility],
            )}
            {...handlerProps}
          >
            <DragNDropIcon />
          </button>
          {children}
        </div>
      </div>
    );
  },
);

export default WithDndHandler;
