import { cn } from '@app/utils/cn';

import { ActiveElementProps } from './props';
import styles from './styles.module.scss';
import { useStyles } from './useStyles';

const ActiveElement = ({
  className,
  children,
  size = 'm',
  variant = 'filled',
  disabled,
  active,
  isIcon,
}: ActiveElementProps) => {
  const _styles = useStyles({ isIcon, variant, size, className, active });
  const _className = cn(
    'transition select-none',
    _styles.width,
    _styles.height,
    _styles.fontSize,
    _styles.colors,
    styles['active-element'],
    className,
    {
      [styles.disabled]: disabled,
    },
  );

  return children({ className: _className });
};

export default ActiveElement;
