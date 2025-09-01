import { useTaskBoard } from '@widgets/task-board/task-board-context';
import CreateTaskForm from '../../shared/CreateTaskForm';

type CreateTaskProps = {
  onCreate: () => void;
  onCancel: () => void;
  parent: string;
};

function CreateSubTask({ onCancel, onCreate, parent }: CreateTaskProps) {
  const { addSubTask } = useTaskBoard();

  const handleTaskCreate = async (data: { name: string }) => {
    onCreate();
    await addSubTask(data.name, parent);
  };

  return (
    <CreateTaskForm
      className='pl-2'
      onCancel={onCancel}
      onCreate={handleTaskCreate}
      variant='sub-task'
    />
  );
}

export default CreateSubTask;
