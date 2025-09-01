import React, { useState, useLayoutEffect, KeyboardEventHandler } from 'react';
import cn from 'classnames';

import Button, { ButtonProps } from '../Button';
import { useRef } from 'react';

type ValidationOptions = 'url';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  name: string;
  defaultValue?: string;
  errors?: any;
  validateAs?: ValidationOptions;
  onButtonClick?: (url: string) => void;
  buttons?: (ButtonProps & { onClickHandler: Function })[];
  link?: string;
}

const InputWithButton = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      name,
      className,
      type,
      validateAs,
      onButtonClick,
      buttons,
      ...rest
    },
    ref
  ) => {
    const [link, setLink] = useState<string>(rest.link ?? '');
    const [isValid, setValidity] = useState<boolean | null>(null);
    const wrapperRef = useRef<HTMLFormElement>(null);

    useLayoutEffect(() => {
      if (!wrapperRef.current) return;
      const input = wrapperRef.current.querySelector('input');
      input?.focus();
    }, []);

    const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value: string = e.currentTarget.value;
      setLink(value);
      setValidity(true);
      if (rest.onChange) {
        rest.onChange(e);
      }
    };

    const handleButtonClick = (event?: React.FormEvent) => {
      event?.preventDefault();
      event?.stopPropagation();

      if (!wrapperRef.current) return;

      // Check for input data validity
      const input = wrapperRef.current.querySelector('input');
      setValidity(!!input?.checkValidity());

      onButtonClick && onButtonClick(link);
      if (buttons?.length) {
        buttons[0]?.onClickHandler && buttons[0]?.onClickHandler(link);
      }
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (e.key === 'Enter') {
        handleButtonClick(e)
      }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      let paste = e.clipboardData.getData('text');

      if (paste) {
        setLink(paste);
        setValidity(true);
      }
    };

    return (
      <form
        className='relative flex'
        ref={wrapperRef}
        onSubmit={handleButtonClick}
        contentEditable={false}
        autoComplete='off'
      >
        <input
          {...rest}
          autoComplete='off'
          ref={ref}
          name={name}
          type={validateAs === 'url' ? 'url' : 'text'}
          className={cn(
            'rounded',
            'w-full',
            'border',
            'border-solid',
            'border-text10',
            'text-sm',
            'py-2.5',
            'px-4',
            'pr-20',
            'hover:border-text20',
            'focus-visible:border-text20',
            'focus:outline-none',
            'disabled:bg-text5',
            'disabled:text-text40',
            'valid:text-fontBlue',
            'invalid:text-fontRed',
            className
          )}
          onChange={handleURLChange}
          onPaste={handlePaste}
          value={link}
          onKeyDown={handleKeyDown}
        />
        <div
          className={cn(
            'absolute',
            'right-0',
            'flex',
            'justify-center',
            'h-full',
            'flex-col'
          )}
        >
          <Button
            onClick={handleButtonClick}
            label='Apply'
            styleType='input-text'
            className={cn('py-1')}
            disabled={!link || !isValid}
          />
        </div>
      </form>
    );
  }
);

export default InputWithButton;
