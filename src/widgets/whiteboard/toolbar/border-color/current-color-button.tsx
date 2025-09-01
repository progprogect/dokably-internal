import cn from 'classnames';
import './style.css';
import { memo } from 'react';
import { ReactComponent as Transparent } from '@images/transparent.svg';

const CurrentColorButton = ({
  color,
  onClick = () => {},
}: {
  color: string;
  onClick?: () => void;
}) => (
  <div
    className={cn('border-color-button__wrapper')}
    style={
      {
        '--text-color-button': color,
      } as React.CSSProperties
    }
    onClick={onClick}
  >
    {color === 'transparent' && <Transparent />}
    {color !== 'transparent' && (
      <div
        className='current-color-button'
        style={
          {
            '--text-color-button': color,
          } as React.CSSProperties
        }
      />
    )}
  </div>
);

export default memo(CurrentColorButton);
