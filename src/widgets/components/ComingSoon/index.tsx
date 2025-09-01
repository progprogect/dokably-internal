import { useMemo } from 'react';
import './style.css';
import { cn } from '@app/utils/cn';

interface IComingSoon {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  alternativeTitle?: string;
  className?: string;
}

const ComingSoon = ({ top, left, right, bottom, alternativeTitle, className }: IComingSoon) => {
  const style = useMemo(() => {
    const styleBuilder = {};
    if (top !== undefined) {
      Object(styleBuilder).top = top;
    }
    if (left !== undefined) {
      Object(styleBuilder).left = left;
    }
    if (right !== undefined) {
      Object(styleBuilder).right = right;
    }
    if (bottom !== undefined) {
      Object(styleBuilder).bottom = bottom;
    }
    return styleBuilder;
  }, [top, left, right, bottom]);
  return (
    <div
      className={cn('coming-soon', className)}
      style={style}
    >
      {alternativeTitle ?? 'Coming soon'}
    </div>
  );
};

export default ComingSoon;
