import { IconComponentsType } from './type';

export const SubDocumentIcon = ({ color }: IconComponentsType) => {
  return (
    <svg width='16' height='17' viewBox='0 0 16 17' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M5.33333 1.625C6.44333 1.69307 7 2.17335 7 3.95077V6.28788C7 7.84596 6.66667 8.625 5 8.625H3C1.33333 8.625 1 7.84596 1 6.28788V3.95077C1 2.17335 1.55667 1.69685 2.66667 1.625H5.33333Z'
        stroke={color}
        strokeWidth='1.2'
        strokeMiterlimit='10'
        strokeLinejoin='round'
      />
      <path
        d='M13.3333 8.625C14.4433 8.69307 15 9.17335 15 10.9508V13.2879C15 14.846 14.6667 15.625 13 15.625H11C9.33333 15.625 9 14.846 9 13.2879V10.9508C9 9.17335 9.55667 8.69685 10.6667 8.625H13.3333Z'
        stroke={color}
        strokeWidth='1.2'
        strokeMiterlimit='10'
        strokeLinejoin='round'
      />
      <path d='M9 13.625H5C4.44772 13.625 4 13.1773 4 12.625V8.125' stroke={color} strokeWidth='1.2' />
    </svg>
  );
};
