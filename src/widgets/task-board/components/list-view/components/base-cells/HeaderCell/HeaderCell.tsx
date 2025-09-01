import { cn } from '@app/utils/cn';
import { ComponentProps } from 'react';
import styles from './style.module.scss';

type HeaderCellProps = ComponentProps<'th'> & {
  sticky?: boolean;
};

function HeaderCell({ children, className, sticky, ...props }: HeaderCellProps) {
  return (
    <div
      role='columnheader'
      className={cn({ 'sticky left-0 z-[2]': sticky, relative: !sticky }, styles['header-cell'], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default HeaderCell;
