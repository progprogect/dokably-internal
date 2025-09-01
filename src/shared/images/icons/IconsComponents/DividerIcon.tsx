import { IconComponentsType } from './type';

export const DividerIcon = ({ color }: IconComponentsType) => {
  return (
    <svg
      width='16'
      height='17'
      viewBox='0 0 16 17'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M13.5 8.625L2.5 8.625'
        stroke={color}
        strokeWidth='1.2'
        strokeLinecap='round'
      />
    </svg>
  );
};
