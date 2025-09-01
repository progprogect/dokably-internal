import { useMemo } from 'react';
import './style.css';
import { ReactComponent as ArrowDown } from '@icons/arrow-down-small.svg';
import { ReactComponent as ArrowUp } from '@icons/arrow-up-small.svg';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { IPrice } from '@app/queries/payment/useGetPriceQuery';

interface IDropdownProps {
  interval: string;
  setInterval: (value: string) => void;
  prices: IPrice[];
}

export default function Dropdown({ interval, prices, setInterval }: IDropdownProps) {
  const billingDetailsOptions = useMemo(() => prices.map((price: { id: string; value: number, recurringInterval: string }) => ({
    key: price.id,
    label: `${price.recurringInterval} — ${price.value}$ / member / month`,
  })), [prices]);

  const { ref, isVisible, setIsVisible } = useClickOutside(false);

  return (
    <div className='dropdown' ref={ref}>
      <div
        onClick={() => {
          setIsVisible(!isVisible);
        }}
        className='dropdown-btn'
      >
        {billingDetailsOptions.find((option: { key: string, label: string }) => option.key === interval)?.label}
        {isVisible ? (
          <ArrowUp className='arrow' />
        ) : (
          <ArrowDown className='arrow' />
        )}
      </div>
      <div 
        className='dropdown-content'
        style={{ display: isVisible ? 'block' : 'none' }}
      >
        {billingDetailsOptions.map((option: { key: string, label: string }) => (
          <div
            key={option.key}
            className='item'
            onClick={() => {
              setInterval(option.key);
              setIsVisible(!isVisible);
            }}
          >
            {option.label}
        </div>
        ))}
      </div>
    </div>
  );
}
