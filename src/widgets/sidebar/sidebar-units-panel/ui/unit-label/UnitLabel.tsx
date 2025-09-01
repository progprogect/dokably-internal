import { Link } from 'react-router-dom';
// import styles from './styles.module.scss';
import { ReactElement } from 'react';
import { cn } from '@app/utils/cn';

type UnitLabelProps = {
  id: string;
  label: string;
  className?: string;
  leftSide?: ReactElement | null;
};

function UnitLabel({ id, label, leftSide, className }: UnitLabelProps) {
  return (
    <Link
      className={cn(
        'flex items-center h-full w-full overflow-hidden cursor-pointer',
        className,
      )}
      to={`workspace/${id}`}
    >
      <span className='shrink-0'>{leftSide}</span>
      <span className='truncate ml-2 leading-[16px]'>{label}</span>
    </Link>
  );
}

export default UnitLabel;
