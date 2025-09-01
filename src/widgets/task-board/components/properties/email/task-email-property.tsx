import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { IProperty, ITask } from '@widgets/task-board/types';
import { FC, useState } from 'react';
import { ControlledInput } from '@shared/uikit/controlled-input';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';

export interface TaskEmailPropertyProps {
  task: ITask;
  property: IProperty;
  size?: 'sm' | 'lg';
  refetch?: () => void;
}

export const TaskEmailProperty: FC<TaskEmailPropertyProps> = ({
  task,
  property,
  refetch,
}) => {
  const { setReadOnly } = useDokablyEditor();
  const { updateTaskEmail } = useTaskBoard();
  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validateValue = (value: string) => {
    const emailIsValid = validateEmail(value);
    setEmailIsValid(emailIsValid);
  };

  const handleChangeEmail = async (value: string) => {
    await updateTaskEmail(task.id, property.id, value);
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
      className={emailIsValid ? 'underline' : ''}
      initialValue={property.value}
      onFocus={() => setReadOnly(true)}
      onBlur={() => setReadOnly(false)}
      onValueChange={(value) => handleChangeEmail(`${value}`)}
      validateValue={validateValue}
    />
  );
};
