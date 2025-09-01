import { IconComponentsType } from './type';

export const DashDividerIcon = ({ color }: IconComponentsType) => {
  return (
    <svg
      width='16'
      height='17'
      viewBox='0 0 16 17'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M13.4674 8.01758H11.2674'
        stroke={color}
        strokeWidth='1.2'
        strokeLinecap='round'
      />
      <path
        d='M9.09485 8.01758H6.89485'
        stroke={color}
        strokeWidth='1.2'
        strokeLinecap='round'
      />
      <path
        d='M4.72229 8.01758H2.52229'
        stroke={color}
        strokeWidth='1.2'
        strokeLinecap='round'
      />
    </svg>
  );
};
