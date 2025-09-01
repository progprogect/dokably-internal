import { FormEvent, useEffect, useRef, useState } from 'react';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { ITask } from '@widgets/task-board/types';
import { ReactComponent as SubTaskIcon } from '@icons/subtasks.svg';
import InputText from '../../shared/InputText';
import { cn } from '@app/utils/cn';
import { useListTableContext } from '../../../context/ListTableContext';

type UpdateTaskProps = {
  defaultValue?: string;
  task: ITask;
  variant: 'task' | 'sub-task';
  autoFocus?: boolean;
};

function UpdateTask({ defaultValue = '', task, variant = 'task', autoFocus }: UpdateTaskProps) {
  const [value, setValue] = useState<string>(defaultValue);
  const formRef = useRef<HTMLFormElement | null>(null);
  const { renameTask } = useTaskBoard();
  const { setEditableTask } = useListTableContext();

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleRenameTask = (value: string) => {
    renameTask(task.id, value);
    setEditableTask(null);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries()) as { taskName: string };
    handleRenameTask(values.taskName);
  };

  return (
    <div className={cn('flex items-center gap-1 w-full', variant === 'sub-task' ? 'pl-2' : '')}>
      {variant === 'sub-task' && <SubTaskIcon className='shrink-0 text-text60' />}
      <form
        ref={formRef}
        onSubmit={handleFormSubmit}
      >
        <InputText
          value={value}
          autoFocus={autoFocus}
          error={value.length === 0}
          placeholder={variant === 'task' ? 'Task name' : 'Sub-task name'}
          onBlur={(event) => {
            handleRenameTask(event.target.value);
          }}
          name='taskName'
          onChange={(event) => {
            setValue(event.target.value);
          }}
        />
      </form>
    </div>
  );
}

export default UpdateTask;
