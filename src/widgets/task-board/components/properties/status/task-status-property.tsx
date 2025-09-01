import {
  STATUS_PROPERTY_TYPE,
  TASK_STATUS_PROPERTY,
} from '@widgets/task-board/constants';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { ISelectOption, ITask } from '@widgets/task-board/types';
import { FC, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@shared/uikit/select';

import { cn } from '@app/utils/cn';

export interface TaskStatusPropertyProps {
  task: ITask;
  size?: 'sm' | 'lg';
  disabled?: boolean;
  refetch?: () => void;
}

export const TaskStatusProperty: FC<TaskStatusPropertyProps> = ({
  task,
  size = 'sm',
  disabled,
  refetch,
}) => {
  const { statusOptions, updateTaskStatus } = useTaskBoard();

  const statusProperty = useMemo<ISelectOption | undefined>(() => {
    const taskProperty = task.properties.find(
      (x) => x.type === STATUS_PROPERTY_TYPE && x.name === TASK_STATUS_PROPERTY,
    );
    if (taskProperty) {
      const priorityOption = statusOptions.find(
        (x) => x.id === taskProperty.value,
      );
      return priorityOption ?? statusOptions[0];
    }

    return statusOptions[0];
  }, [task.properties, statusOptions]);

  const [value, setValue] = useState(statusProperty);
  const handleChangeStatus = async (statusId: string) => {
    const selectedOption = statusOptions.find(option => option.id === statusId);
    setValue(selectedOption);
    await updateTaskStatus(task.id, statusId);
    refetch?.();
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    }, 0);
  };

  return value ? (
    <Select
      value={value?.id}
      onValueChange={handleChangeStatus}
      disabled={disabled}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setTimeout(() => {
            const activeElement = document.activeElement;
            if (activeElement instanceof HTMLElement) {
              activeElement.blur();
            }
          }, 0);
        }
      }}
    >
      <SelectTrigger className='w-fit h-fit border-none outline-none bg-transparent p-0 [&>svg]:hidden'>
        <div
          className='px-2 py-1.5 rounded-md text-[14px] text-[#29282c]'
          style={{
            backgroundColor: value?.params.color,
          }}
        >
          {value?.name}
        </div>
      </SelectTrigger>
      <SelectContent className='outline-none border-none'>
        {statusOptions.map((item) => {
          return (
            <SelectItem
              key={`priority-${item.id}`}
              value={item.id.toString()}
              className={cn(
                'rounded-sm cursor-pointer hover:bg-backgroundHover',
                {},
              )}
            >
              <div
                className='px-2 py-1.5 rounded-md text-xs'
                style={{ backgroundColor: item.params.color }}
              >
                {item.name}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  ) : (
    <></>
  );
};
