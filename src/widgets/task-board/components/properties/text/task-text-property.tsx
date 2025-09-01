import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { IProperty, ITask } from '@widgets/task-board/types';
import { FC } from 'react';
import { ControlledInput } from '@shared/uikit/controlled-input';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';

export interface TaskTextPropertyProps {
  task: ITask;
  property: IProperty;
  size?: 'sm' | 'lg';
  refetch?: () => void;
}

export const TaskTextProperty: FC<TaskTextPropertyProps> = ({
  task,
  property,
  refetch,
}) => {
  const { setReadOnly } = useDokablyEditor();
  const { updateTaskText } = useTaskBoard();

  const handleChangeText = async (value: string) => {
    await updateTaskText(task.id, property.id, value);
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
      contentEditableMode
      initialValue={property.value || ""}
      onFocus={() => setReadOnly(true)}
      onBlur={() => setReadOnly(false)}
      onValueChange={(value) => handleChangeText(`${value}`)}
    />
  );
};
