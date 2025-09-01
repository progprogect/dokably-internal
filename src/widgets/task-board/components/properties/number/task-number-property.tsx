import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { IProperty, ITask } from '@widgets/task-board/types';
import { FC } from 'react';
import { ControlledInput } from '@shared/uikit/controlled-input';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';

export interface TaskNumberPropertyProps {
  task: ITask;
  property: IProperty;
  size?: 'sm' | 'lg';
  refetch?: () => void;
}

export const TaskNumberProperty: FC<TaskNumberPropertyProps> = ({
  task,
  property,
  // size = 'sm',
  refetch,
}) => {
  const { setReadOnly } = useDokablyEditor();
  const { updateTaskNumber } = useTaskBoard();

  const handleChangeNumber = async (value: number) => {
    await updateTaskNumber(task.id, property.id, value);
    refetch?.();
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    }, 0);
  };

  return (
    <ControlledInput
      initialValue={property.value}
      type='number'
      onFocus={() => {
        setReadOnly(true);
      }}
      onBlur={() => {
        setReadOnly(false);
      }}
      onValueChange={(value) => {
        handleChangeNumber(+value);
      }}
    />
  );
};
