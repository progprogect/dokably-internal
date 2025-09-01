import { useEffect, useState } from 'react';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { ITask } from '@widgets/task-board/types';
import InputText from '../../shared/InputText';

type UpdateTaskProps = {
  defaultValue?: string;
  task: ITask;
  propertyId: string;
};

function UpdateTaskText({
  defaultValue = '',
  task,
  propertyId,
}: UpdateTaskProps) {
  const [value, setValue] = useState<string>(defaultValue);
  const { updateTaskText } = useTaskBoard();

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <InputText
      value={value}
      onBlur={() => {
        updateTaskText(task.id, propertyId, value);
      }}
      onChange={(event) => {
        setValue(event.target.value);
      }}
    />
  );
}

export default UpdateTaskText;
