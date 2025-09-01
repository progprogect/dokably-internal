import React from 'react';
import cn from 'classnames';

import { ReactComponent as Eye } from '../../images/eye.svg';
import { ReactComponent as EyeSlash } from '../../images/eyeSlash.svg';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  name: string;
  defaultValue?: string;
  errors?: any;
  errorClassName?: string;
}

const InputBase = React.forwardRef<HTMLInputElement, InputProps>(
  ({ errors = {}, name, className, type, errorClassName, ...rest }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const renderPasswordEye = () => {
      if (showPassword) {
        return <Eye className='absolute h-4 w-4 top-3 right-4' />;
      }

      return <EyeSlash className='absolute h-4 w-4 top-3 right-4' />;
    };

    return (
      <div className='relative'>
        <input
          {...rest}
          ref={ref}
          name={name}
          type={
            type === 'password' ? (showPassword ? 'text' : 'password') : type
          }
          className={cn(
            'rounded w-full border border-solid border-text10 hover:border-text20 focus-visible:border-text20 focus:outline-none text-sm py-2.5 px-4 disabled:bg-text5 disabled:text-text40',
            className
          )}
        />
        {errors[name] && (
          <div className={cn('text-errorText mt-1.5 text-xs', errorClassName)}>
            {String(errors[name]?.message)}
          </div>
        )}
        {type === 'password' && (
          <div
            className='cursor-pointer'
            onClick={() => setShowPassword(!showPassword)}
          >
            {renderPasswordEye()}
          </div>
        )}
      </div>
    );
  }
);

export default InputBase;
