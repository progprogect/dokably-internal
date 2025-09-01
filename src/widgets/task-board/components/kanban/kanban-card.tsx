import { FC, useEffect, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useSearchParams } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { LoaderIcon } from 'react-hot-toast';

import { ITask } from '@widgets/task-board/types';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import DeleteIcon from '@widgets/editor/plugins/blocks/Table/img/Delete';
import { DATE_PROPERTY_TYPE } from '@widgets/task-board/constants';
import { useGetSubTasks } from '@app/queries/task/sub-task/useGetSubtasks';
import { cn } from '@app/utils/cn';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@shared/uikit/dropdown-menu';

import { TaskPriorityProperty } from '../properties/priority/task-priority-property';
import { TaskAssignProperty } from '../properties/assignee/task-assign-property';
import AddKanbanSubTask from '../list-view/components/shared/AddKanbanSubTask/AddKanbanSubTask';
import { TaskDateProperty } from '../properties/date/task-date-property';

import SubTask from './kanban-subtask';

export interface IKanbanCard {
  task: ITask;
  index: number;
  columnId: string;
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => void;
  draggedCardId: string | null;
  setDraggedCardId: (value: string | null) => void;
}

export const KanbanCard: FC<IKanbanCard> = ({ task, columnId, index, moveCard, draggedCardId, setDraggedCardId }) => {
  const { id } = useTaskBoard();
  const { addSubTask, deleteTask } = useTaskBoard();
  const { subtasks, refetch } = useGetSubTasks({ taskBoardId: id, parentTaskId: task.id });

  const [, setSearchParams] = useSearchParams();

  const [isShowDropdownSelect, setIsShowDropdownSelect] = useState(false);

  // useEffect(() => {
  //   return () => {
  //     const blockers = document.querySelectorAll('[data-dismissable]');
  //     blockers.forEach((blocker) => blocker.remove());
  //   };
  // }, []);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'CARD',
    item: { type: 'CARD', id: task.id, columnId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: () => {
      setDraggedCardId(null);
    },
  });

  const [, drop] = useDrop({
    accept: 'CARD',
    hover: (item: any) => {
      if (item.id !== task.id) {
        moveCard(item.id, item.columnId, columnId, index);
        item.columnId = columnId;
      }
    },
  });

  const [expanded, setExpanded] = useState<boolean>(false);
  const [showNewSubTask, setShowNewSubtask] = useState<boolean>(false);
  const [subtaskIsLoading, setSubtaskIsLoading] = useState<boolean>(false);

  const onToggleExpand = () => setExpanded((value) => !value);
  const onShowSubTaskTemplate = () => setShowNewSubtask(true);
  const onHideSubTaskTemplate = () => setShowNewSubtask(false);

  useEffect(() => {
    if (!task.subtasks?.length) {
      setExpanded(false);
    }
  }, [task.subtasks?.length]);

  const openTaskPanel = (taskId: string, isSubtask?: boolean) =>
    setSearchParams({ task: taskId, board: id, isSubtask: `${!!isSubtask}` });

  const handleSubTaskCreate = async (data: { name: string }) => {
    setSubtaskIsLoading(true);
    await addSubTask(data.name, task.id);
    refetch();
    setSubtaskIsLoading(false);
    onHideSubTaskTemplate();
  };

  const handleTaskDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };
  const handleSubTaskDelete = async (taskId: string) => {
    await deleteTask(taskId);
    refetch();
  };

  const dateProperty = task.properties.find((p) => p.type === DATE_PROPERTY_TYPE);

  useEffect(() => {
    if (isDragging) {
      setDraggedCardId(task?.id);
    }
  }, [isDragging, task?.id, setDraggedCardId]);

  useEffect(() => {
    preview(null);
  }, [preview]);

  return (
    <div
      key={task.id}
      ref={(node) => drag(drop(node))}
      style={{ opacity: draggedCardId === task?.id ? 0 : 1 }}
      onClick={() => openTaskPanel(task.id, false)}
      onMouseEnter={() => setIsShowDropdownSelect(true)}
      onMouseLeave={() => setIsShowDropdownSelect(false)}
      className='flex flex-col justify-between cursor-pointer w-full p-3 rounded-md bg-white'
    >
      <div className='min-h-[100px] flex flex-col justify-between cursor-pointer w-full'>
        <div className='flex items-start justify-between w-full'>
          <div className='text-sm/[18px] overflow-hidden break-words'>{task.name}</div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className={'h-6 w-6'}
            >
              <MoreHorizontal
                className={cn(
                  'h-6 w-6 p-1 rounded-sm cursor-pointer hover:bg-text10',
                  !isShowDropdownSelect && 'hidden',
                )}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='border-border'
              contentEditable={false}
              onClick={(e) => e.stopPropagation()}
            >
              {/* <DropdownMenuItem
                  className='hover:bg-text10/60 px-2 py-1.5 rounded-md cursor-pointer text-text70 flex items-center gap-2'
                  // onClick={handleDuplicate}
                >
                  <DuplicateIcon /> Duplicate
                </DropdownMenuItem> */}
              <DropdownMenuItem
                className='hover:bg-text10/60 px-2 py-1.5 rounded-md cursor-pointer text-text70 flex items-center gap-2'
                onClick={() => handleTaskDelete(task.id)}
              >
                <DeleteIcon /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* <div>
        </div> */}
        {dateProperty?.value && (
          <div className='flex mt-[18px]'>
            <TaskDateProperty
              task={task}
              property={dateProperty}
              className='text-[12px]'
            />
          </div>
        )}
        <div className='flex items-center justify-between mt-[11px]'>
          <div className='flex items-center gap-1 flex-1'>
            <TaskPriorityProperty task={task} />
            <TaskAssignProperty
              task={task}
              iconClassName='opacity-0 group-hover/assignee:opacity-100 absolute top-[-4px] right-[-4px] bg-[#eaeaea]'
            />
            {dateProperty && !dateProperty?.value && (
              <TaskDateProperty
                task={task}
                property={dateProperty}
                className='text-[#a9a9ab]'
              />
            )}
          </div>
          <div className='flex items-center gap-1'>
            <AddKanbanSubTask
              subtasksAmount={subtasks.length}
              expanded={expanded}
              toggleExpand={onToggleExpand}
              onShowSubTaskTemplate={onShowSubTaskTemplate}
            />
          </div>
        </div>
      </div>
      {/* /// subtasks */}
      {showNewSubTask && (
        <SubTask
          isNewSubTask
          handleSubTaskCreate={handleSubTaskCreate}
          onHideSubTaskTemplate={onHideSubTaskTemplate}
        />
      )}
      {subtaskIsLoading && (
        <LoaderIcon
          style={{ width: 20, height: 20 }}
          className='animate-spin'
        />
      )}
      {expanded &&
        subtasks?.map((subtask) => (
          <SubTask
            subtask={subtask}
            handleSubTaskDelete={handleSubTaskDelete}
            refetchSubTasks={refetch}
            openTaskPanel={openTaskPanel}
          />
        ))}
    </div>
  );
};
