import { IconComponentsType } from './type';

export const BookmarkIcon = ({ color }: IconComponentsType) => {
  return (
    <svg width='16' height='17' viewBox='0 0 16 17' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12.6666 14.625L7.99992 11.2917L3.33325 14.625V3.95833C3.33325 3.60471 3.47373 3.26557 3.72378 3.01552C3.97382 2.76548 4.31296 2.625 4.66659 2.625H11.3333C11.6869 2.625 12.026 2.76548 12.2761 3.01552C12.5261 3.26557 12.6666 3.60471 12.6666 3.95833V14.625Z'
        stroke={color}
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};
