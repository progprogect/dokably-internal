import cn from 'classnames';
import './style.css';
import { memo } from 'react';

const BorderCancelButton = ({
  onClick = () => {},
}: {
  onClick?: () => void;
}) => (
  <div
    className={cn('border-color-button__wrapper')}
    style={
      {
        '--text-color-button': '#A9A9AB',
      } as React.CSSProperties
    }
    onClick={onClick}
  >
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
    >
      <rect
        x='0.6'
        y='0.6'
        width='14.8'
        height='14.8'
        rx='7.4'
        stroke='#A9A9AB'
        strokeWidth='1.2'
      />
      <path d='M13.5 2.5L2.5 13.5' stroke='#A9A9AB' strokeWidth='1.2' />
    </svg>
  </div>
);

export default memo(BorderCancelButton);
