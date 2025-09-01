import { FC, useRef, useState } from 'react';
import { CopyIcon, CornerDownLeft, MoreHorizontal } from 'lucide-react';

import Tippy from '@tippyjs/react';
import { Unit } from '@entities/models/unit';
import BlockType from '@entities/enums/BlockType';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@shared/uikit/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@shared/uikit/dialog';
import { Button } from '@shared/uikit/button/button';
import { track } from '@amplitude/analytics-browser';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';
import { ReactComponent as KanbanIcon } from '@icons/kanban-icon.svg';
import { ReactComponent as ListIcon } from '@icons/list-board-icon.svg';
import { ReactComponent as TableViewIcon } from '@icons/table-view.svg';
import { ReactComponent as DeleteIcon } from '@icons/trash-grey.svg';
import { cn } from '@app/utils/cn';

import { TaskBoardView } from '../types';
import 'tippy.js/animations/scale.css';

export interface TaskBoardHeaderProps {
  board: Unit;
  view: TaskBoardView;
  onRenameBoard: (board: Unit) => void;
  onCopy: (board: Unit) => void;
  onDelete: (board: Unit) => void;
  onChangeView: (view: TaskBoardView) => void;
}

export const TaskBoardHeader: FC<TaskBoardHeaderProps> = ({
  board,
  view,
  onRenameBoard,
  onCopy,
  onDelete,
  onChangeView,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setReadOnly } = useDokablyEditor();

  const [focused, setFocus] = useState<boolean>(false);
  const [name, setName] = useState<string>(board.name);
  const [open, setOpen] = useState<boolean>(false);

  const handleUpdateName = () => {
    if (board.name != name && name.length != 0) {
      onRenameBoard({
        ...board,
        name: name,
      });
      inputRef.current?.blur();
    } else {
      setName(board.name);
    }
  };

  const handleCopyBoard = () => {
    onCopy(board);
  };

  const handleDeleteBoard = () => {
    track('trash_delete_confirmed', { id: board.id });
    onDelete(board);
    setOpen(false);
  };

  const setView = (view: TaskBoardView) => {
    onChangeView(view);
  };

  return (
    <>
      <div className='flex items-center justify-between h-8'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center'>
            <Tippy
              placement='top'
              className='tooltip'
              content={<span>{board.name}</span>}
              duration={0}
            >
              <input
                ref={inputRef}
                type='text'
                className={cn(
                  'bg-background whitespace-normal max-w-[76px] px-1 py-0 text-lg font-medium focus:outline-text50',
                  {
                    'truncate cursor-pointer': !focused,
                  },
                )}
                value={name}
                onFocus={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setFocus(true);
                  setReadOnly(true);
                }}
                onBlur={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setFocus(false);
                  if (name != board.name) {
                    handleUpdateName();
                  }
                  setReadOnly(false);
                }}
                onChange={(e) => {
                  e.preventDefault();
                  setName(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === '/') {
                    e.stopPropagation();
                  }
                  if (e.key === 'Enter') {
                    inputRef.current?.blur();
                  }
                }}
              />
            </Tippy>
          </div>
          <div className='flex gap-2 items-center'>
            <Tippy
              placement='top'
              className='tooltip'
              content={<span>Kanban view</span>}
              duration={0}
            >
              <KanbanIcon
                className={cn('w-6 h-6 p-1 rounded-sm cursor-pointer hover:bg-backgroundHover', {
                  'bg-text10': view === BlockType.Kanban,
                })}
                onClick={() => {
                  setView(BlockType.Kanban);
                }}
              />
            </Tippy>
            <Tippy
              placement='top'
              className='tooltip'
              content={<span>List view</span>}
              duration={0}
            >
              <ListIcon
                className={cn('w-6 h-6 p-1 rounded-sm cursor-pointer hover:bg-backgroundHover', {
                  'bg-text10': view === BlockType.ListView,
                })}
                onClick={() => {
                  setView(BlockType.ListView);
                }}
              />
            </Tippy>
            <Tippy
              placement='top'
              className='tooltip'
              content={<span>Table view</span>}
              duration={0}
            >
              <TableViewIcon
                className={cn('w-6 h-6 p-1 rounded-sm cursor-pointer text-text40 hover:bg-backgroundHover', {
                  'bg-text10': view === BlockType.TableView,
                })}
                onClick={() => {
                  setView(BlockType.TableView);
                }}
              />
            </Tippy>
          </div>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-6 w-6 p-1 rounded-sm cursor-pointer hover:bg-backgroundHover' />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='border-border'
            contentEditable={false}
          >
            <DropdownMenuItem
              className='hover:bg-backgroundHover/60 px-2 py-1.5 rounded-md cursor-pointer text-text70 flex items-center gap-2'
              onClick={handleCopyBoard}
            >
              <CopyIcon size={16} /> Copy board
            </DropdownMenuItem>
            <DropdownMenuItem
              className='hover:bg-backgroundHover/60 px-2 py-1.5 rounded-md cursor-pointer text-text70 flex items-center gap-2'
              onClick={() => setOpen(true)}
            >
              <DeleteIcon /> Delete board
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog
        open={open}
        onOpenChange={() => setOpen(false)}
      >
        <DialogContent
          className='w-[512px]'
          contentEditable={false}
        >
          <DialogHeader>
            <DialogTitle className='text-wrap break-all'>Delete {board.name}</DialogTitle>
          </DialogHeader>
          <DialogDescription>This action cannot be undone.</DialogDescription>

          <div>
            <div>Do you want to continue?</div>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='secondary'
              className='flex-1 bg-background hover:bg-accent border-none'
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              icon={<CornerDownLeft className='w-4 h-4 mr-2' />}
              variant='secondary'
              className='flex-1 bg-background hover:bg-accent text-destructive border border-input'
              onClick={handleDeleteBoard}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
