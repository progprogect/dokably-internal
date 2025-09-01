import { IconComponentsType } from './type';

export const BasicTableIcon = ({ color }: IconComponentsType) => {
  return (
    <svg width='16' height='17' viewBox='0 0 16 17' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M6.00001 15.2923L10 15.2923C13.3333 15.2923 14.6667 13.959 14.6667 10.6257L14.6667 6.62565C14.6667 3.29232 13.3333 1.95898 10 1.95898L6.00001 1.95898C2.66668 1.95898 1.33334 3.29232 1.33334 6.62565L1.33334 10.6257C1.33334 13.959 2.66668 15.2923 6.00001 15.2923Z'
        stroke={color}
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14.6666 7.29102L1.33326 7.29102'
        stroke={color}
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M10.3331 7.29102L10.3331 15.291'
        stroke={color}
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M5.6666 7.29102L5.6666 15.291'
        stroke={color}
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};
