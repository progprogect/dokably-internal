import { ComponentProps } from 'react';
import styles from './styles.module.scss';
import { cn } from '@app/utils/cn';

type BodyCellContentProps = ComponentProps<'div'> & {
  $contentAlign?: 'center' | 'start' | 'end';
};

function BodyCellContent({
  children,
  style,
  $contentAlign = 'center',
  className,
  ...props
}: BodyCellContentProps) {
  const _style = { '--content-align': $contentAlign, ...style };
  return (
    <div
      style={_style}
      className={cn(styles['body-cell-content'], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default BodyCellContent;
