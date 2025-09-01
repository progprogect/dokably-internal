import { ComponentProps } from 'react';
import { cn } from '@app/utils/cn';

type BodyCellProps = ComponentProps<'td'> & {
  sticky?: boolean;
};

function BodyCell({ children, className, sticky, ...props }: BodyCellProps) {
  return (
    <div
      role='cell'
      className={cn(className, {
        'sticky left-0 z-[2]': sticky,
      })}
      {...props}
    >
      {children}
    </div>
  );
}

export default BodyCell;
