import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { IProperty, ITask } from '@widgets/task-board/types';
import { FC } from 'react';
import DatePicker from '../../shared/date-picker';

export interface TaskDatePropertyProps {
  task: ITask;
  disabled?: boolean;
  property: IProperty;
  refetch?: () => void;
  className?: string;
}

export const TaskDateProperty: FC<TaskDatePropertyProps> = ({ task, disabled, property, className, refetch }) => {
  const { updateTaskDueDate } = useTaskBoard();

  const handleChangeDate = async (value: Date | null) => {
    await updateTaskDueDate(task.id, property.id, value);
    refetch?.();
  };

  return (
    <DatePicker
      className={`hover:bg-[#ffffff00] px-[0px] text-[14px] text-[#29282C] ${className}`}
      disabled={disabled}
      value={property.value ?? null}
      onChange={handleChangeDate}
    />
  );
};
