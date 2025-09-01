import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/uikit/dropdown-menu';
import { ReactComponent as DeleteIcon } from '@icons/trash.svg';
import { ReactComponent as PenIcon } from '@icons/pen-grey.svg';
import { ReactComponent as DuplicateIcon } from '@icons/subtasks.svg';
import { MouseEvent, ReactElement } from 'react';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { ITask } from '@widgets/task-board/types';
import ActionButton from '../../shared/ActionButton';
import { useListTableContext } from '../../../context/ListTableContext';

enum ACTIONS {
  RENAME = 'rename',
  DUPLICATE = 'duplicate',
  DELETE = 'delete',
}

type TaskActionsProps = {
  task: ITask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactElement;
};

function TaskActions({ task, open, trigger, onOpenChange }: TaskActionsProps) {
  const { duplicateTask, deleteTask } = useTaskBoard();
  const { setEditableTask } = useListTableContext();

  const handleTaskAction = (e: MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.name as ACTIONS;

    switch (value) {
      case ACTIONS.RENAME: {
        setEditableTask({ task, value: 'name' });
        break;
      }
      case ACTIONS.DUPLICATE: {
        duplicateTask(task);
        break;
      }
      case ACTIONS.DELETE: {
        deleteTask(task.id);
        break;
      }
    }

    onOpenChange(false);
  };

  return (
    <DropdownMenu
      open={open}
      modal={false}
      onOpenChange={onOpenChange}
    >
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        sideOffset={12}
        className='border-border'
      >
        <DropdownMenuItem asChild>
          <ActionButton
            $icon={<PenIcon />}
            name={ACTIONS.RENAME}
            onClick={handleTaskAction}
          >
            Rename
          </ActionButton>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <ActionButton
            name={ACTIONS.DUPLICATE}
            $icon={<DuplicateIcon />}
            onClick={handleTaskAction}
          >
            Duplicate
          </ActionButton>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <ActionButton
            name={ACTIONS.DELETE}
            $icon={<DeleteIcon className='text-base' />}
            onClick={handleTaskAction}
          >
            Delete
          </ActionButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TaskActions;
