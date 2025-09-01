import { IconComponentsType } from './type';

export const ArrowUpIcon = ({ color }: IconComponentsType) => {
  return (
    <svg
      width='17'
      height='17'
      viewBox='0 0 17 17'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M4.14844 10.3516L7.44133 7.05867C7.83186 6.66814 8.46502 6.66815 8.85554 7.05867L12.1484 10.3516'
        stroke={color}
        strokeWidth='1.5'
        strokeLinecap='round'
      />
    </svg>
  );
};
