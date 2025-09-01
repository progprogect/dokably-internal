import React, { ReactNode } from 'react';
import cn from 'classnames';

import { ReactComponent as Loader } from '../images/loader.svg';

enum ButtomStyles {
  'primary' = 'bg-primary text-white text-base py-2.5 hover:bg-primaryHover disabled:bg-background disabled:text-text40 w-full',
  'network' = 'bg-white text-15 py-3 text-text90 hover:bg-backgroundHover w-full',
  'small-black' = 'bg-text90 text-sml py-2 text-white hover:bg-text disabled:bg-background disabled:text-text40',
  'small-primary' = 'bg-primary text-sml py-2 text-white hover:bg-primaryHover disabled:bg-background disabled:text-text40',
  'small-gray' = 'text-sml py-2 bg-background text-text90 hover:bg-backgroundHover disabled:bg-background disabled:text-text40',
  'small-white' = 'text-sml py-2 bg-white text-text90 hover:bg-background disabled:bg-background disabled:text-text40',
  'small-darkgray' = 'text-sml py-2 bg-backgroundHover text-text90 hover:bg-background disabled:bg-background disabled:text-text40',
  'input-text' = 'text-sml text-text90 disabled:text-text50',
  'custom' = '',
  'ghost' = 'hover:bg-accent hover:text-accent-foreground',
  'big-gray' = 'text-sml py-2 bg-background text-text90 hover:bg-backgroundHover disabled:bg-background disabled:text-text40 w-full',
}

type ButtomStyleStrings = keyof typeof ButtomStyles;
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  isLoading?: boolean;
  label?: string;
  styleType: ButtomStyleStrings;
  icon?: React.ReactNode;
  iconAfter?: React.ReactNode;
  iconOnly?: boolean;
  labelClassName?: string;
  children?: ReactNode
}

const Button: React.FC<ButtonProps> = ({
  icon,
  iconAfter,
  styleType,
  isLoading,
  label,
  className,
  iconOnly = false,
  labelClassName,
  children,
  ...rest
}) => {
  const additionalStyles = ButtomStyles[styleType];

  const styles = cn(
    'rounded',
    {
      'px-4': !iconOnly,
      'min-w-button': !iconOnly,
    },
    'disabled:cursor-not-allowed',
    'border-none',
    'font-medium',
    className,
    'justify-center',
    'inline-flex',
    'items-center',
    additionalStyles,
  );

  return (
    <button
      className={styles}
      {...rest}
    >
      {isLoading && (
        <Loader className='inline w-4 h-4 text-white animate-spin' />
      )}
      <div
        className={cn(
          'flex items-center',
          { 'ml-3': isLoading },
          labelClassName,
        )}
      >
        {icon}
        {label}
        {iconAfter}
        {children}
      </div>
    </button>
  );
};

export default Button;
