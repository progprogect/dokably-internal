import { useState } from 'react';
import './style.css';
import { ReactComponent as ArrowDown } from '@icons/arrow-down-small.svg';
import { ReactComponent as ArrowUp } from '@icons/arrow-up-small.svg';
import { useLocalStorage } from 'usehooks-ts';
import { useClickOutside } from '@app/hooks/useClickOutside';

export default function DropdownCountries() {
  const [selected, setIsSelected] = useState('United States');
  const [, setLocalStorageKey] = useLocalStorage('Country', 'United States');
  const { ref, isVisible, setIsVisible } = useClickOutside(false);

  return (
    <div className='dropdown__countries' ref={ref}>
      <div
        onClick={(e) => {
          setIsVisible(!isVisible);
        }}
        className='dropdown-btn'
      >
        {selected}
        {isVisible ? (
          <ArrowUp className='arrow' />
        ) : (
          <ArrowDown className='arrow' />
        )}
      </div>
      <div
        className='dropdown__countries-content'
        style={{ display: isVisible ? 'block' : 'none' }}
      >
        <div
          onClick={(e: any) => {
            setIsSelected(e.target.textContent);
            setLocalStorageKey(e.target.textContent);
            setIsVisible(!isVisible);
          }}
          className='item'
        >
          United States
        </div>
        <div
          className='item'
          onClick={(e: any) => {
            setIsSelected(e.target.textContent);
            setLocalStorageKey(e.target.textContent);
            setIsVisible(!isVisible);
          }}
        >
          Belarus
        </div>
      </div>
    </div>
  );
}
