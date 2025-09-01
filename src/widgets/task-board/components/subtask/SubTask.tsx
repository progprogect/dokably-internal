import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { ITask } from '@widgets/task-board/types';
import { FC, useState } from 'react';
import { ReactComponent as SubTaskIcon } from '@icons/subtasks.svg';

import { ReactComponent as DeleteIcon } from '@icons/trash-grey.svg';
import { MoreHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/uikit/dialog';
import { Button } from '@shared/uikit/button/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/uikit/dropdown-menu';
import { TaskPriorityProperty } from '../properties/priority/task-priority-property';
import { TaskStatusProperty } from '../properties/status/task-status-property';
import { TaskAssignProperty } from '../properties/assignee/task-assign-property';
import { useSearchParams } from 'react-router-dom';

export interface TaskInformationProps {
  subtask: ITask;
  refetch: () => void;
}

export const SubTask: FC<TaskInformationProps> = ({ subtask, refetch }) => {
  const [, setSearchParams] = useSearchParams();

  const { deleteTask, id } = useTaskBoard();

  const [openDelete, setOpenDelete] = useState<boolean>(false);

  return (
    <>
      <div className='rounded-md w-full bg-background px-3 py-2 flex items-center gap-2'>
        <SubTaskIcon className='w-4 h-4 text-text60' />
        <div
          className='flex-1 text-sm cursor-pointer'
          onClick={() => {
            setSearchParams({ task: subtask.id, board: id, isSubtask: "true" });
          }}
        >
          <span>{subtask.name}</span>
        </div>
        <TaskPriorityProperty
          task={subtask}
          size='sm'
          refetch={refetch}
        />
        <TaskAssignProperty
          task={subtask}
          size='sm'
          refetch={refetch}
        />
        <TaskStatusProperty
          task={subtask}
          size='sm'
          refetch={refetch}
        />
        <DropdownMenu modal={true}>
          <DropdownMenuTrigger>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent className='border-border'>
            <DropdownMenuItem
              className='hover:bg-backgroundHover/60 px-2 py-1.5 rounded-md cursor-pointer text-text70 flex items-center gap-2'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenDelete(true);
              }}
            >
              <DeleteIcon /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog
        open={openDelete}
        onOpenChange={() => setOpenDelete(false)}
      >
        <DialogContent
          className='w-[512px]'
          contentEditable={false}
        >
          <DialogHeader>
            <DialogTitle className='text-wrap break-all flex flex-wrap gap-1 items-center'>
              Delete task "{subtask.name}"
            </DialogTitle>
          </DialogHeader>

          <div>
            <div>Do you want to continue?</div>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='secondary'
              className='flex-1 bg-background hover:bg-accent border-none'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenDelete(false);
              }}
            >
              Cancel
            </Button>
            <Button
              icon={
                <DeleteIcon className='w-4 h-4 mr-2 [&>path]:stroke-destructive' />
              }
              variant='secondary'
              className='flex-1 bg-background hover:bg-accent text-destructive border-none'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteTask(subtask.id);
                setOpenDelete(false);
                refetch();
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
