import { useState, ChangeEvent, KeyboardEvent, useEffect } from 'react';
// import { CheckIcon, XIcon } from 'lucide-react';
import { cn } from '@app/utils/cn';
// import { Button } from './button/button';
import styles from "./styles.module.scss";

export interface ControlledInputProps {
  className?: string;
  initialValue?: number | string;
  type?: 'string' | 'number' | 'checkbox';
  contentEditableMode?: boolean;
  onValueChange?: (value: number | string | boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  validateValue?: (value: string) => void;
}

export const ControlledInput = ({
  className,
  initialValue = '',
  type = 'string',
  contentEditableMode,
  onValueChange,
  onFocus,
  onBlur,
  validateValue,
}: ControlledInputProps) => {
  const [value, setValue] = useState<string | number | boolean>(initialValue);
  const [editingValue, setEditingValue] = useState<string | number | boolean>(initialValue);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleSave = () => {
    setValue(editingValue);
    setIsFocused(false);
    onValueChange?.(editingValue);
  };

  const handleCancel = () => {
    setEditingValue(value);
    setIsFocused(false);
  };

  const handleFocus = () => {
    if (type !== "checkbox") {
      onFocus?.();
      setIsFocused(true);
    }
  };

  const handleBlur = () => {
    if (!isFocused) return;
    handleSave();
    onBlur?.();
    setIsFocused(false);
    validateValue?.(`${editingValue}`);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
    if (type === "checkbox") {
      onValueChange?.(!initialValue);
    } else {
      setEditingValue(newValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      handleCancel();
      (e.target as HTMLInputElement).blur();
    }
  };

  useEffect(() => {
    setValue(initialValue);
    setEditingValue(initialValue);
    validateValue?.(`${initialValue}`);
  }, [initialValue]);

  return (
    <div className='relative flex w-full items-center'>
      {contentEditableMode ? (
        <span
          contentEditable
          placeholder={'Empty'}
          onFocus={handleFocus}
          onBlur={e => {
            const editingValue = e.currentTarget.innerText;
            setValue(editingValue);
            setIsFocused(false);
            onValueChange?.(editingValue);
            onBlur?.();
          }}
          onKeyDown={handleKeyDown}
          role='textbox'
          className={cn(
            styles.editable,
            'rounded-md w-full text-[#29282C] bg-[transparent] border-text10 hover:border-text20 focus-visible:outline-none focus:outline-none focus:ring-0 border-none text-sm py-1.5 px-2 disabled:bg-text5 disabled:text-text40 h-10 px-0 py-1 h-[auto] overflow-hidden cursor-pointer resize-none',
            {
              'border-solid': isFocused,
              'cursor-pointer': !isFocused,
            },
            className,
          )}
        > 
          {`${editingValue}`}
        </span>
      ) : (
        <input
          type={type || 'text'}
          placeholder={type === 'number' ? '0' : 'Empty'}
          value={typeof(editingValue) !== "boolean" ? editingValue : undefined}
          checked={type === "checkbox" ? !!editingValue : undefined}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            'rounded-md w-full text-[#29282C] bg-[transparent] border-text10 hover:border-text20 focus-visible:outline-none focus:outline-none focus:ring-0 border-none text-sm py-1.5 px-2 disabled:bg-text5 disabled:text-text40 h-10 p-0 h-[24px] cursor-pointer',
            {
              'border-solid': isFocused,
              'cursor-pointer': !isFocused,
            },
            className,
          )}
        />
      )}
      {isFocused && (
        <div
          className='relative flex gap-1'
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* <Button
            className='h-[24px]'
            icon={<CheckIcon size={16} />}
            variant='outline'
            onClick={() => {
              handleSave();
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              };
            }}
          ></Button>
          <Button
            className='h-[24px]'
            icon={<XIcon size={16} />}
            variant='outline'
            onClick={() => {
              handleCancel();
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              };
            }}
          ></Button> */}
        </div>
      )}
    </div>
  );
};
