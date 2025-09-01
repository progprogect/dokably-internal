import { ComponentProps } from 'react';
import styles from './styles.module.scss';
import { cn } from '@app/utils/cn';

type HeaderCellContentProps = ComponentProps<'div'> & {
  $contentAlign?: 'center' | 'start' | 'end';
  $uppercase?: boolean;
};

function HederCellContent({
  children,
  style,
  $contentAlign = 'center',
  $uppercase,
  className,
  ...props
}: HeaderCellContentProps) {
  const _style = { '--content-align': $contentAlign, ...style };
  return (
    <div
      style={_style}
      className={cn(
        styles['header-cell-content'],
        { [styles.uppercase]: $uppercase },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default HederCellContent;
