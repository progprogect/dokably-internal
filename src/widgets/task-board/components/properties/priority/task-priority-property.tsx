import {
  SELECT_PROPERTY_TYPE,
  TASK_PRIORITY_PROPERTY,
} from '@widgets/task-board/constants';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { ISelectOption, ITask } from '@widgets/task-board/types';
import { FC, useEffect, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@shared/uikit/select';

import { ReactComponent as Flag } from '@icons/flag.svg';
import { cn } from '@app/utils/cn';
import classNames from 'classnames';
import { CheckIcon } from 'lucide-react';
import { isEqual } from 'lodash';

export interface TaskPriorityPropertyProps {
  task: ITask;
  size?: 'sm' | 'lg';
  disabled?: boolean;
  refetch?: () => void;
  className?: string;
}

export const TaskPriorityProperty: FC<TaskPriorityPropertyProps> = ({
  task,
  size = 'sm',
  disabled,
  refetch,
  className
}) => {
  const { priorityOptions, updateTaskPriority } = useTaskBoard();

  const priorityProperty = useMemo<ISelectOption | undefined>(() => {
    const taskProperty = task.properties.find(
      (x) =>
        x.type === SELECT_PROPERTY_TYPE && x.name === TASK_PRIORITY_PROPERTY,
    );
    if (taskProperty) {
      const priorityOption = priorityOptions.find(
        (x) => x.id === taskProperty.value,
      );
      return priorityOption ?? priorityOptions[0];
    }

    return priorityOptions[0];
  }, [task.properties, priorityOptions]);

  const [value, setValue] = useState(priorityProperty);
  const handleChangePriority = async (priorityId: string) => {
    const selectedOption = priorityOptions.find(option => option.id === priorityId);
    setValue(selectedOption);
    await updateTaskPriority(task.id, priorityId);
    refetch?.();
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    }, 0);
  };

  useEffect(() => {
    if (!isEqual(priorityProperty, value)) setValue(priorityProperty);
  }, [priorityProperty]);

  return value ? (
    <Select
      value={value?.id}
      onValueChange={handleChangePriority}
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
        <div className={classNames('h-6 rounded-md cursor-pointer flex items-center justify-center px-1', className)}>
          <Flag
            style={{
              color: value?.params.color,
            }}
          />
          {size != 'sm' && value?.name}
        </div>
      </SelectTrigger>
      <SelectContent className='outline-none border-none p-[4px] w-[176px] shadow-menu'>
        {priorityOptions.map((item) => {
          return (
            <SelectItem
              key={`priority-${item.id}`}
              value={item.id.toString()}
              className={cn(
                'rounded-lg cursor-pointer hover:bg-backgroundHover pt-2 pb-2 mt-[1px] mb-[1px] text-[#69696B]',
                {},
              )}
            >
              <div className='flex flex-row gap-2 items-center'>
                <Flag
                  style={{
                    color: item.params.color,
                  }}
                />
                <div>{item.name}</div>
                {value?.id === item.id.toString() && (
                  <div className='absolute right-[8px]'>
                    <CheckIcon size={16} color={"#29282C"} />
                  </div>
                )}
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
