import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { IProperty, ITask } from '@widgets/task-board/types';
import { FC, useState } from 'react';
import { ControlledInput } from '@shared/uikit/controlled-input';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';

export interface TaskCheckboxPropertyProps {
  task: ITask;
  property: IProperty;
  size?: 'sm' | 'lg';
  refetch?: () => void;
}

export const TaskCheckboxProperty: FC<TaskCheckboxPropertyProps> = ({
  task,
  property,
  refetch,
}) => {
  const { setReadOnly } = useDokablyEditor();
  const { updateTaskCheckbox } = useTaskBoard();
  const [value, setValue] = useState(property.value);

  const handleChangeCheckbox = async (value: boolean) => {
    setValue(value);
    await updateTaskCheckbox(task.id, property.id, value);
    refetch?.();
  };

  return (
    <ControlledInput
      className='w-[auto]'
      type="checkbox"
      initialValue={value}
      onFocus={() => setReadOnly(true)}
      onBlur={() => setReadOnly(false)}
      onValueChange={(value) => handleChangeCheckbox(!!value)}
    />
  );
};
