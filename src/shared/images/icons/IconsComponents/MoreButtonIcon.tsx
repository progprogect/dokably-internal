import { IconComponentsType } from './type';

export const MoreButtonIcon = ({ color }: IconComponentsType) => {
  return (
    <svg
      width='20'
      height='21'
      viewBox='0 0 20 21'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle
        cx='15'
        cy='10.7344'
        r='1.25'
        transform='rotate(90 15 10.7344)'
        fill={color}
      />
      <circle
        cx='10'
        cy='10.7344'
        r='1.25'
        transform='rotate(90 10 10.7344)'
        fill={color}
      />
      <circle
        cx='5'
        cy='10.7344'
        r='1.25'
        transform='rotate(90 5 10.7344)'
        fill={color}
      />
    </svg>
  );
};
