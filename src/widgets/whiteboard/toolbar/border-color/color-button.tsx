import cn from 'classnames';
import './style.css';
import { memo } from 'react';
import { ReactComponent as Transparent } from '@images/transparent.svg';

const ColorButton = ({
  color,
  onClick = () => { },
}: {
  color: string;
  onClick?: () => void;
}) => (
  <div
    className={cn('border-color-button__wrapper')}
    style={
      {
        '--text-color-button': (color === '#FFFFFF' ? '#D4D4D5' : color),
      } as React.CSSProperties
    }
    onClick={onClick}
  >
    {color === 'transparent' && <Transparent />}
    {color !== 'transparent' && (
      <div
        className='border-color-button'
        style={
          {
            '--text-color-button': color,
            ...(color === '#FFFFFF' ? { 'border': '1px solid #D4D4D5' } : {})
          } as React.CSSProperties
        }
      />
    )}
  </div>
);

export default memo(ColorButton);
