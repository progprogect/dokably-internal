import { cn } from '@app/utils/cn';
import { useEffect, useRef, useState } from 'react';

interface TaskNameFiledProps {
  initialValue?: string;
  className?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function TaskNameFiled({
  initialValue = '',
  className,
  placeholder = 'Task title...',
  onChange,
}: TaskNameFiledProps) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    autoResize();
    onChange?.(e.target.value);
  };

  useEffect(() => {
    autoResize();
  }, [initialValue]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={1}
      className={cn(
        'w-full resize-none overflow-hidden border border-text10 rounded-md p-2 text-sm focus:outline-none focus:border-text20',
        className,
      )}
    />
  );
}
