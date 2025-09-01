import { CSSProperties, forwardRef } from 'react';
import { useTaskBoard } from './task-board-context';
import { cn } from '@app/utils/cn';
import { TaskBoardHeader } from './components/task-board-header';
import { TaskBoardBody } from './components/task-board-body';
import { Unit } from '@entities/models/unit';
import { TaskBoardView } from './types';
import { Drawer, DrawerClose, DrawerContent } from '@shared/uikit/drawer';
import { useGetTask } from '@app/queries/task/useGetTask';
import { TaskInformation } from './components/task/TaskInformation';
import { ReactComponent as Hide } from '@images/doubleArrow.svg';
import { useTaskBoardDrawerSearchParams } from './utils/useTaskBoardDrawerSearchParams';
  
interface TaskBoardProps {
  style?: CSSProperties;
  className?: string;
  view: TaskBoardView;
  onDelete: (unit: Unit) => void;
  onCopy: (unit: Unit) => void;
  onChangeView: (view: TaskBoardView) => void;
  onRenameBoard: (unit: Unit) => void;
}

const TaskBoard = forwardRef<HTMLDivElement, TaskBoardProps>(
  ({ style, className, view, onCopy, onDelete, onChangeView, onRenameBoard }, ref) => {
    const { board, id } = useTaskBoard();

    const [searchParams, , { deleteSearchParams }] = useTaskBoardDrawerSearchParams();

    const taskId = searchParams.task;
    const boardId = searchParams.board;
    const { task, refetch } = useGetTask({
      taskId: String(taskId),
      enabled: !!taskId && taskId.length != 0 && boardId?.length != 0 && boardId === id,
    });

    const closeDrawer = () => {
      deleteSearchParams(['task', 'board', 'isSubtask']);
    };

    if (!board) return null;

    return (
      <div
        ref={ref}
        className={cn('w-full p-4 bg-background rounded-lg flex flex-col gap-2 relative', className)}
        style={style}
      >
        <TaskBoardHeader
          board={board}
          view={view}
          onCopy={onCopy}
          onDelete={onDelete}
          onChangeView={onChangeView}
          onRenameBoard={onRenameBoard}
        />
        <TaskBoardBody view={view} />
        <Drawer
          open={!!taskId && !!board && boardId === id}
          onClose={closeDrawer}
          direction='right'
          dismissible={false}
        >
          <DrawerContent
            className='w-[760px] py-3'
            onOverlayClick={() => {
              closeDrawer();
            }}
          >
            <DrawerClose
              className='absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
              onClick={(e) => {
                e.preventDefault();
                closeDrawer();
              }}
            >
              <Hide className='rotate-180' />
              <span className='sr-only'>Close</span>
            </DrawerClose>
            {task && (
              <TaskInformation
                task={task}
                unit={board}
                refetchTask={refetch}
              />
            )}
          </DrawerContent>
        </Drawer>
      </div>
    );
  },
);

export default TaskBoard;
