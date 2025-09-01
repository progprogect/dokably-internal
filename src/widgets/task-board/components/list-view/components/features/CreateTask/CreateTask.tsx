import { useTaskBoard } from '@widgets/task-board/task-board-context';
import CreateTaskForm from '../../shared/CreateTaskForm';
import { ISelectOption } from '@widgets/task-board/types';

type CreateTaskProps = {
  onCreate: () => void;
  onCancel: () => void;
};

function CreateTask({ onCancel, onCreate }: CreateTaskProps) {
  const { statusOptions, addTask } = useTaskBoard();
  const noneStatusOption: ISelectOption | undefined =
    statusOptions.find((option) => option.name === 'None') ?? statusOptions[0];

  const handleTaskCreate = async (data: { name: string }) => {
    onCreate();
    await addTask(data.name, noneStatusOption?.id);
  };

  return (
    <CreateTaskForm
      onCancel={onCancel}
      onCreate={handleTaskCreate}
      variant='task'
    />
  );
}

export default CreateTask;
