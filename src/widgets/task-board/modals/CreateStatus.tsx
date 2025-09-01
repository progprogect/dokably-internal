import { ISelectOption } from '../types';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import Tippy from '@tippyjs/react';import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/uikit/dialog';
import { Button } from '@shared/uikit/button/button';
import { CornerDownLeft, Plus } from 'lucide-react';

import { cn } from '@app/utils/cn';
import { COLORS_LIST } from '../constants';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';

interface ICreateStatus {
  statusOptions: ISelectOption[];
  trigger?: ReactNode;
  onCreateStatus: (name: string, select: string) => void;
}

export const CreateStatus: FC<ICreateStatus> = ({
  statusOptions,
  trigger,
  onCreateStatus,
}) => {
  const { setReadOnly } = useDokablyEditor();

  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('New column');
  const [color, setColor] = useState<string>('#d4d4d5');

  useEffect(() => {
    const newStatusCount = statusOptions.filter((status) =>
      status.name.startsWith('New column'),
    ).length;
    if (newStatusCount != 0) {
      setName(`New column ${newStatusCount}`);
    } else {
      setName('New column');
    }
  }, [statusOptions]);

  const handleReset = () => {
    const newStatusCount = statusOptions.filter((status) =>
      status.name.startsWith('New column'),
    ).length;
    if (newStatusCount != 0) {
      setName(`New column ${newStatusCount}`);
    } else {
      setName('New column');
    }
    setColor('#d4d4d5');
  };

  const nameValidate = useMemo(() => {
    if (name.length === 0) {
      return 'The name must consist of at least one character.';
    }

    if (statusOptions.map((x) => x.name).includes(name)) {
      return 'This name already exists';
    }

    return true;
  }, [name, statusOptions]);

  const handleCreateStatus = async () => {
    await onCreateStatus(name, color);
    handleReset();
    setOpen(false);
  };

  return (
    <>
      <Tippy
        placement='top'
        className='tooltip'
        content={<span>Add column</span>}
      >
        <div
          onClick={() => {
            setOpen(true);
          }}
        >
          {trigger ?? (
            <Plus className='bg-white w-6 h-6 p-1 m-2 rounded-sm cursor-pointer hover:bg-backgroundHover' />
          )}
        </div>
      </Tippy>
      <Dialog
        open={open}
        onOpenChange={() => {
          setOpen(false);
          handleReset();
        }}
      >
        <DialogContent
          className='w-[512px]'
          contentEditable={false}
        >
          <DialogHeader>
            <DialogTitle className='text-wrap break-all'>
              Create column
            </DialogTitle>
          </DialogHeader>
          <div>
            <label>Name</label>
            <input
              type='text'
              className='rounded-md w-full border border-solid border-text10 hover:border-text20 focus-visible:border-text20 focus:outline-none text-sm py-1.5 px-2 disabled:bg-text5 disabled:text-text40'
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
                  handleCreateStatus();
                }
              }}
            />
            {nameValidate != true && (
              <div className='text-destructive'>{nameValidate}</div>
            )}
          </div>
          <div className='flex gap-1 items-center'>
            {COLORS_LIST.map((item: string) => {
              return (
                <div
                  key={`color-${item}`}
                  style={{ backgroundColor: `${item}` }}
                  className={cn(
                    'rounded-full w-6 h-6 cursor-pointer hover:border hover:border-primary',
                    {
                      'border border-primary': item === color,
                    },
                  )}
                  onClick={() => {
                    setColor(item);
                  }}
                />
              );
            })}
          </div>
          <div className='flex gap-2'>
            <Button
              variant='secondary'
              className='flex-1 bg-background hover:bg-accent border border-none'
              onClick={() => {
                setOpen(false);
                handleReset();
              }}
            >
              Cancel
            </Button>
            <Button
              icon={
                <CornerDownLeft className='w-4 h-4 mr-2 [&>path]:stroke-white' />
              }
              disabled={nameValidate != true}
              className='flex-1 border-none'
              onClick={() => {
                handleCreateStatus();
              }}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
