import { ChangeEvent, FC } from 'react';
import cn from 'classnames';
import './style.css';

type Props = {
  className?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  step?: number;
};

const Slider: FC<Props> = ({
  className,
  min = 0,
  max = 100,
  defaultValue,
  value,
  onValueChange,
  step = 1,
}) => {
  const handleChange = (value: number) => {
    onValueChange && onValueChange(value);
  };

  return (
    <div className={cn('slidecontainer', className)}>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          event.stopPropagation();
          event.preventDefault();
          handleChange(+event.target.value);
        }}
        className='slider'
        id='myRange'
      />
    </div>
  );
};

export default Slider;
