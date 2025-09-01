import { cn } from '@app/utils/cn';
import styles from './styles.module.scss';

type ColoredIconProps = {
  color: string | null;
  letter: string;
  className?: string;
};

function ColoredIcon({ color, letter, className }: ColoredIconProps) {
  const _color = color ?? '#719eff88';
  return (
    <div
      className={cn(styles['colored-icon'], className)}
      style={{
        backgroundColor: _color,
        color:
          parseInt(_color.replace('#', ''), 16) > 0xffffff / 2
            ? '#000'
            : '#fff',
      }}
    >
      <span>{letter}</span>
    </div>
  );
}

export default ColoredIcon;
