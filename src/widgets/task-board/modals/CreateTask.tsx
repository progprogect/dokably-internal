import { FC, useEffect, useRef, useState } from 'react';
import { CornerDownLeft, Plus } from 'lucide-react';

import { Button } from '@shared/uikit/button/button';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { cn } from '@app/utils/cn';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';

interface ICreateTask {
  title?: string;
  statusId: string;
  variant?: 'card' | 'row';
  className?: string;
  onCreateTask: (name: string, statusId: string) => void;
}

export const CreateTask: FC<ICreateTask> = ({
  title = 'ADD TASK',
  variant = 'row',
  statusId,
  className,
  onCreateTask,
}) => {
  const taskRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { setReadOnly } = useDokablyEditor();
  const { ref, isVisible, setIsVisible } = useClickOutside(false, () => {}, 'mouseup');

  const [name, setName] = useState<string>('');

  const handleCreateTask = async () => {
    const trimmedName = name.trim();

    if (trimmedName.length !== 0) {
      onCreateTask(trimmedName, statusId);
      setIsVisible(false);
      setReadOnly(false);
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    setName('');
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && taskRef.current) {
      taskRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    let timer: NodeJS.Timeout;
    if (isVisible && textareaRef.current) {
      timer = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          setReadOnly(true);
        }
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <>
      <div ref={ref}>
        {!isVisible ? (
          <div
            className={cn(
              'flex gap-2 items-center mx-2 rounded-md cursor-pointer px-2 py-1.5 hover:bg-backgroundHover',
              {
                'text-xs w-fit': variant === 'card',
                'w-full': variant === 'row',
              },
              className,
            )}
            onClick={(e) => {
              e.preventDefault();
              setIsVisible(true);
            }}
          >
            <Plus className='w-4 h-4' />
            {title}
          </div>
        ) : (
          <div
            ref={taskRef}
            className={cn('flex justify-between bg-white p-3 rounded-md gap-2', {
              'min-h-[100px] flex-col': variant === 'card',
              'w-full flex-row': variant === 'row',
            })}
          >
            <textarea
              ref={textareaRef}
              autoFocus
              className='rounded-md w-full h-auto min-h-6 overflow-hidden box-border resize-none border border-solid border-text10 hover:border-text20 focus-visible:border-text20 focus:outline-none text-sm py-1.5 px-2 disabled:bg-text5 disabled:text-text40'
              rows={1}
              onInput={handleInput}
              value={name}
              onFocus={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setReadOnly(true);
              }}
              onBlur={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setReadOnly(false);
              }}
              onChange={(e) => {
                e.preventDefault();
                setReadOnly(true);
                setName(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === '/') {
                  e.stopPropagation();
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleCreateTask();
                }
              }}
            />

            <div className='flex justify-end'>
              <Button
                icon={<CornerDownLeft className='w-4 h-4 mr-2' />}
                className='h-fit'
                disabled={name.trim().length === 0}
                onClick={handleCreateTask}
              >
                Create
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
