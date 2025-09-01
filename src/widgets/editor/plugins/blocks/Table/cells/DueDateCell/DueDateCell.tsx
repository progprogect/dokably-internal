import { useCallback, useEffect, useState, MouseEvent } from 'react';
import cn from 'classnames';
import { X } from 'lucide-react';

import Calendar from '@shared/uikit/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';

import { ActionTypes } from '../../utils';

import style from './style.module.scss';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

interface Props {
  value: string;
  columnId: string;
  rowIndex: number;
}

export const DueDateCell = ({ value, columnId, rowIndex }: Props) => {
  const [cellValue, setCellValue] = useState<Date>();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { dataDispatch } = useTableContext();

  const updateCell = useCallback(
    (date: Date | undefined) => {
      dataDispatch({
        type: ActionTypes.UPDATE_CELL,
        columnId,
        rowIndex,
        value: date?.toISOString() ?? '',
      });
    },
    [cellValue],
  );

  useEffect(() => {
    if (!value) return;

    setCellValue(new Date(value));
  }, [value]);

  const handleDateChange = (date: Date) => {
    setCellValue(date);
    setIsPopoverOpen(false);
  };

  const handlePopoverOpenChange = () => {
    if (isPopoverOpen) {
      updateCell(cellValue);
    }
    setIsPopoverOpen(!isPopoverOpen);
  };

  const handleClearDate = (e: MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();

    setCellValue(undefined);

    updateCell(undefined);
  };

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={handlePopoverOpenChange}
    >
      <PopoverTrigger>
        <div className={cn(style.cell, { [style.active]: isPopoverOpen })}>
          {cellValue && (
            <span className={style.date}>
              {cellValue.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              })}
              <X
                className={style.remove}
                size={16}
                onClick={handleClearDate}
              />
            </span>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        className={style.popover}
        portal
        autoFocusContent={false}
        side='bottom'
        align='start'
      >
        <Calendar
          selectedDate={cellValue}
          onSelect={handleDateChange}
        />
      </PopoverContent>
    </Popover>
  );
};
