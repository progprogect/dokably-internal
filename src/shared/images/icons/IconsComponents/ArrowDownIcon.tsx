import { IconComponentsType } from './type';

export const ArrowDownIcon = ({ color }: IconComponentsType) => {
  return (
    <svg
      width='17'
      height='16'
      viewBox='0 0 17 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M12.5 6L9.20711 9.29289C8.81658 9.68342 8.18342 9.68342 7.79289 9.29289L4.5 6'
        stroke={color}
        strokeWidth='1.5'
        strokeLinecap='round'
      />
    </svg>
  );
};
