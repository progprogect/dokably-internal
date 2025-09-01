import { cn } from '@app/utils/cn';
import { ComponentPropsWithRef, forwardRef } from 'react';

type InputTextProps = ComponentPropsWithRef<'input'> & {
  error?: boolean;
  active?: boolean;
  type?: string;
};

const InputText = forwardRef<HTMLInputElement, InputTextProps>(function InputText(
  { className, error, active, type, ...props },
  ref,
) {
  return (
    <input
      {...props}
      ref={ref}
      className={cn(
        `w-full h-6
            transition-all rounded
            ps-1 pe-1 pt-0.5 pb-0.5
            border border-purple focus:border-primaryHover outline-none
            bg-transparent focus:bg-white hover:bg-white hover:border-text20`, 
        className,
        {
          ['border-primaryHover']: active,
          ['border-errorText']: error,
        },
      )}
      type={type || 'text'}
    />
  );
});

export default InputText;
