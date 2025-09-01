import React from 'react';
import { IconComponentsType } from './type';

export const PlusIcon = ({ color }: IconComponentsType) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
    >
      <path
        d='M3.11133 8H12.8891'
        stroke={color}
        strokeWidth='1.2'
        strokeLinecap='round'
      />
      <path
        d='M8 12.8872V3.10938'
        stroke={color}
        strokeWidth='1.2'
        strokeLinecap='round'
      />
    </svg>
  );
};
