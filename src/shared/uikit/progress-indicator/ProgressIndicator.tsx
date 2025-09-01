import { CSSProperties } from 'react';
import styles from './styles.module.scss';
import { ProgressIndicatorProps } from './props';
import { cn } from '@app/utils/cn';

const RADIUS = 8;

function ProgressIndicator({
  progress,
  'aria-label': ariaLabel,
  className,
  ...props
}: ProgressIndicatorProps) {
  const circumference = 2 * Math.PI * RADIUS;

  const offset = circumference - (progress / 100) * circumference;
  const iconStyle = {
    '--progress-ring-offset': offset,
    '--progress-ring-circumference': circumference,
  } as CSSProperties;

  return (
    <div
      style={iconStyle}
      className={cn(styles['progress-ring'], className)}
      {...props}
    >
      <progress
        className={styles['native-progress']}
        id='circular-progress'
        value={progress}
        max={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        aria-valuemax={100}
        aria-label={ariaLabel}
      ></progress>
      <svg
        viewBox='0 0 18 18'
        className={styles['progress-ring__svg']}
      >
        <circle
          className={styles['progress-ring__circle']}
          cx='9'
          cy='9'
          r={RADIUS}
          stroke='currentColor'
          strokeWidth='2'
          fill='transparent'
        />
      </svg>
      <div className={styles['progress-ring__text']}>{progress}%</div>
    </div>
  );
}

export default ProgressIndicator;
