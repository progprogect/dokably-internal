import React from 'react';

import cn from 'classnames';

interface Props {
  value: string | JSX.Element;
  backgroundColor: string;
  className?: string;
}

export default function Badge({ value, backgroundColor, className }: Props) {
  return (
    <span
      className={cn(
        'font-weight-400 d-inline-block color-grey-800 border-radius-sm text-transform-capitalize',
        className
      )}
      style={{
        backgroundColor: backgroundColor,
        padding: '2px 6px',
      }}
    >
      {value}
    </span>
  );
}
