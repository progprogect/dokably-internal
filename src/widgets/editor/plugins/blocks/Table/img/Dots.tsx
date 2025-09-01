export default function DotsIcon({ className }: { className?: string }) {
  return (
    <svg
      width='9'
      height='3'
      viewBox='0 0 9 3'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <circle
        cx='1.14453'
        cy='1.19531'
        r='1'
        fill='currentColor'
      />
      <circle
        cx='4.14453'
        cy='1.19531'
        r='1'
        fill='currentColor'
      />
      <circle
        cx='7.14453'
        cy='1.19531'
        r='1'
        fill='currentColor'
      />
    </svg>
  );
}
