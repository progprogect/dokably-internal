import { IButton } from './props';
import cn from 'classnames';
import './style.css';

const Button = ({ buttonType, children, onClick, className = '', disabled }: IButton) => {
  return (
    <button
      className={cn('btn-default', buttonType, className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
