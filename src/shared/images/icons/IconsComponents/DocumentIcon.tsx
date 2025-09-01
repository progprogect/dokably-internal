import React from 'react';
import { IconComponentsType } from './type';

export const DocumentIcon = ({ color }: IconComponentsType) => {
  return (
    <svg width='16' height='17' viewBox='0 0 16 17' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M4.66666 8.80273H9.99999'
        stroke={color}
        strokeWidth='1.2'
        strokeMiterlimit='10'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M4.66666 11.6836H7.99999'
        stroke={color}
        strokeWidth='1.2'
        strokeMiterlimit='10'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M10.6667 1.95898C12.8867 2.08864 14 3.00346 14 6.38902V10.8407C14 13.8084 13.3333 15.2923 10 15.2923H6C2.66667 15.2923 2 13.8084 2 10.8407V6.38902C2 3.00346 3.11333 2.09585 5.33333 1.95898H10.6667Z'
        stroke={color}
        strokeWidth='1.2'
        strokeMiterlimit='10'
        strokeLinejoin='round'
      />
    </svg>
  );
};
