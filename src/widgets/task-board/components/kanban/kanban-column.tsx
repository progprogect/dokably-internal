import { FC, useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, PencilIcon } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { LoaderIcon } from 'react-hot-toast';

import { cn } from '@app/utils/cn';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@shared/uikit/dropdown-menu';
import { Button } from '@shared/uikit/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/uikit/dialog';
import { ISelectOption, ITask } from '@widgets/task-board/types';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { CreateTask } from '@widgets/task-board/modals/CreateTask';
import { STATUS_PROPERTY_TYPE } from '@widgets/task-board/constants';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';
import Tippy from '@tippyjs/react';
import { ReactComponent as DeleteIcon } from '@icons/trash-grey.svg';
import { ReactComponent as RenameIcon } from '@icons/pen-grey.svg';

import { KanbanCard } from './kanban-card';
import { IColumn } from './kanban-body';

export interface IKanbanColumn {
  column: IColumn;
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => void;
  moveColumn: (fromColumnId: string, toColumnId: string) => void;
  draggedCardId: string | null;
  setDraggedCardId: (value: string | null) => void;
}

export const KanbanColumn: FC<IKanbanColumn> = ({ column, moveCard, moveColumn, draggedCardId, setDraggedCardId }) => {
  const { board, statusProperty, updateStatus, deleteStatus, addTask, statusOptions, updateTaskStatus } =
    useTaskBoard();

  const { setReadOnly } = useDokablyEditor();
  const { id, name: title, params, cards } = column;

  const [name, setName] = useState<string>(title);
  const [taskIsLoading, setTaskIsLoading] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [renameOpen, setRenameModalOpen] = useState<boolean>(false);
  const isNoneColumn = title === 'None';

  useEffect(() => {
    setTaskIsLoading(false);
  }, [cards]);

  const nameValidate = useMemo(() => {
    if (title !== 'None' && name === 'None') {
      return 'This name already exists';
    }
    if (name.length === 0) {
      return 'The name must consist of at least one character.';
    }

    if (
      statusOptions
        .filter((status) => status.name !== title)
        .map((x) => x.name)
        .includes(name)
    ) {
      return 'This name already exists';
    }

    return true;
  }, [name, title, statusOptions]);

  const handleCreateTask = async (name: string, statusId: string) => {
    setTaskIsLoading(true);
    await addTask(name, statusId);
    setTaskIsLoading(false);
  };

  const handleDeleteStatus = async () => {
    if (!isNoneColumn && cards.length) {
      const noneOptionId = statusOptions.find((option) => option.name === 'None')?.id;
      if (noneOptionId) {
        const promises = cards.map((card) => updateTaskStatus(card.id, noneOptionId));
        await Promise.all(promises);
      }
    }
    await deleteStatus(id);
    setDeleteModalOpen(false);
  };

  const handleUpdateName = async () => {
    if (statusProperty && board) {
      const updatedStatusOption: ISelectOption = {
        ...column,
        name,
      };
      updateStatus(updatedStatusOption);
    }
    setRenameModalOpen(false);
  };

  const onStatusChange = async (task: ITask) => {
    await updateTaskStatus(task.id, id);
  };

  const [{}, drag] = useDrag({
    type: 'COLUMN',
    item: { type: 'COLUMN', id: column.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ['CARD', 'COLUMN'],
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
      drop: (item: any) => {
        if (item.type === 'CARD') {
          if (item.columnId !== id) {
            moveCard(item.id, item.columnId, id, cards.length);
            item.columnId = id;
          }
          setTimeout(() => {
            const currentCardStatusId = cards
              .find((card) => card.id === item.id)
              ?.properties.find((p) => p.type === STATUS_PROPERTY_TYPE)?.value;
            if (currentCardStatusId !== item.columnId) {
              onStatusChange(item);
            }
            setDraggedCardId(null);
          }, 0);
        }
        if (item.type === 'COLUMN') {
          if (item.id !== id) {
            moveColumn(item.id, id);
            item.id = id;
          }
        }
      },
    }),
    [cards],
  );

  return (
    <>
      <div
        ref={(node) => drag(drop(node))}
        className={cn(
          'w-60 min-w-[240px] p-2 rounded-md flex flex-col gap-4 relative group group/column cursor-pointer',
          { 'bg-text10': isOver, 'hover:bg-backgroundHover': !isOver },
        )}
      >
        <div className='flex items-center justify-between sticky top-0'>
          <div className='text-xs flex items-center gap-1 flex-1 overflow-hidden mr-2'>
            <Tippy
              placement='top'
              className='tooltip'
              content={<span>{title}</span>}
              duration={0}
            >
              <div
                className='px-2 py-1.5 rounded-md w-fit truncate'
                style={{ backgroundColor: params.color }}
              >
                {title}
              </div>
            </Tippy>
            <div>{column.cards.length}</div>
          </div>
          {!isNoneColumn && (
            <div className='opacity-0 group-hover:opacity-[1]'>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className='h-6 w-6 p-1 rounded-sm cursor-pointer hover:bg-text10' />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='border-border'
                  contentEditable={false}
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    className='hover:bg-text10/60 px-2 py-1.5 rounded-md cursor-pointer text-text70 flex items-center gap-2'
                    onClick={() => setRenameModalOpen(true)}
                  >
                    <PencilIcon size={16} /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='hover:bg-text10/60 px-2 py-1.5 rounded-md cursor-pointer text-text70 flex items-center gap-2'
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    <DeleteIcon /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div
          className={cn('flex flex-col gap-2 overflow-y-auto pb-4', {
            'flex-grow min-h-[200px]': isOver,
          })}
        >
          {cards.map((card, index) => (
            <KanbanCard
              key={card.id}
              index={index}
              columnId={id}
              task={card}
              moveCard={moveCard}
              draggedCardId={draggedCardId}
              setDraggedCardId={setDraggedCardId}
            />
          ))}
          {taskIsLoading && (
            <LoaderIcon
              style={{ width: 20, height: 20 }}
              className='animate-spin'
            />
          )}
          <CreateTask
            statusId={id}
            variant='card'
            onCreateTask={handleCreateTask}
          />
        </div>
      </div>

      <Dialog
        open={deleteModalOpen}
        onOpenChange={() => setDeleteModalOpen(false)}
      >
        <DialogContent
          className='w-[512px]'
          contentEditable={false}
        >
          <DialogHeader>
            <DialogTitle className='text-wrap break-all flex flex-wrap gap-1 items-center'>
              Delete status
              <div
                className='px-2 py-1.5 rounded-md text-xs'
                style={{ backgroundColor: params.color }}
              >
                {title}
              </div>
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
                setDeleteModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              icon={<DeleteIcon className='w-4 h-4 mr-2 [&>path]:stroke-destructive' />}
              variant='secondary'
              className='flex-1 bg-background hover:bg-accent text-destructive border-none'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteStatus();
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={renameOpen}
        onOpenChange={() => {
          setRenameModalOpen(false);
          setName(title);
        }}
      >
        <DialogContent
          className='w-[512px]'
          contentEditable={false}
        >
          <DialogHeader>
            <DialogTitle className='text-wrap break-all flex flex-wrap gap-1 items-center'>
              Rename status
              <div
                className='px-2 py-1.5 rounded-md text-xs'
                style={{ backgroundColor: params.color }}
              >
                {title}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div>
            <label>New status name</label>
            <input
              type='text'
              className='rounded w-full border border-solid border-text10 hover:border-text20 focus-visible:border-text20 focus:outline-none text-sm py-2.5 px-4 disabled:bg-text5 disabled:text-text40'
              value={name}
              onFocus={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setReadOnly(true);
              }}
              onBlur={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setReadOnly(false);
              }}
              onChange={(e) => {
                e.preventDefault();
                setReadOnly(true);
                setName(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateName();
                }
              }}
            />
            {nameValidate !== true && <div className='text-destructive'>{nameValidate}</div>}
          </div>
          <div className='flex gap-2'>
            <Button
              variant='secondary'
              className='flex-1 bg-background hover:bg-accent'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setRenameModalOpen(false);
                setName(title);
              }}
            >
              Cancel
            </Button>
            <Button
              icon={<RenameIcon className='w-4 h-4 mr-2 [&>path]:stroke-white' />}
              className='flex-1 border-none'
              disabled={nameValidate !== true}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUpdateName();
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
