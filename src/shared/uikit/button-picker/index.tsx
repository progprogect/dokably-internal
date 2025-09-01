import { useMemo, CSSProperties } from 'react';
import ButtonPickerListProps from './props';
import styles from './style.module.scss';
import cn from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import { useClickOutside } from '@app/hooks/useClickOutside';

// Gotta redo it. Shit came out
const ButtonPicker = ({
  icon,
  isActive,
  onClick,
  title,
  childrens,
  height = 38,
  width = 38,
  position,
  rowCount,
  columnCount,
  displayText,
  childrensAlign,
  forceVisible = false,
  className,
  listClassName
}: ButtonPickerListProps) => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);

  const style = useMemo(() => {
    const styles: CSSProperties = {};

    if (width) {
      styles.width = width;
    }

    if (height) {
      styles.height = height;
    }

    return styles;
  }, [width, height]);

  const listStyle = useMemo(() => {
    const styles: CSSProperties = {};
    if (!childrens) return styles;

    if (
      childrens &&
      childrens.length > 0 &&
      position &&
      rowCount &&
      columnCount
    ) {
      if (position === 'right') {
        styles.left = 'calc(100% + 11px)';
        styles.right = 'auto';
        styles.top = 'auto';
        styles.bottom = 'auto';
      }

      if (position === 'bottom') {
        styles.left = 'auto';
        styles.right = 'auto';
        styles.top = 'calc(100% + 11px)';
        styles.bottom = 'auto';
      }

      //TODO: create style for another positions

      //gap = 10, padding = 8
      styles.width = (columnCount - 1) * 10 + 16 + width * columnCount + 'px';
      styles.height = (rowCount - 1) * 10 + 16 + height * rowCount + 'px';
    }

    return styles;
  }, [position, childrens, rowCount, columnCount]);

  return (
    <div
      ref={ref}
      className={cn(
        styles.buttonPicker,
        {
          [styles.buttonPickerActive]: isActive || forceVisible || isVisible,
        },
        className
      )}
      onClick={
        childrens && childrens.length > 0
          ? () => setIsVisible(!isVisible)
          : onClick
      }
      title={title}
      style={style}
    >
      {icon}
      {displayText}
      {childrens && childrens.length > 0 && (forceVisible || isVisible) && (
        <div className={cn(styles.list, 'picker-list', listClassName)} style={listStyle}>
          {childrens.map((item) => (
            <div
              key={uuidv4()}
              className={cn(styles.buttonPicker__outline, {
                [`${item.className}`]: item.className,
              })}
              title={item.title}
              style={{
                ...style,
                width: item.width ?? width,
                height: height ?? height,
                justifyContent: childrensAlign ?? 'center',
              }}
              onClick={item.onClick}
            >
              {item.icon}
              {item.displayText}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ButtonPicker;
