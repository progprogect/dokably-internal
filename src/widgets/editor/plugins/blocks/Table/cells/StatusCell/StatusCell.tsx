import { useCallback, useEffect, useState } from 'react';
import cn from 'classnames';

import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import { Option } from '@widgets/editor/plugins/blocks/Table/Table.types';

import { ActionTypes } from '../../utils';

import { StatusMenu } from './StatusMenu';
import style from './style.module.scss';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

interface Props {
  columnId: string;
  rowIndex: number;
  value: string | null;
  options: Option[];
}

export const StatusCell = ({ columnId, rowIndex, value, options }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { dataDispatch } = useTableContext();
  const selectedOption = options.find((option) => option.id === value);

  const updateValue = useCallback(
    (value: Option | null) => {
      dataDispatch({
        type: ActionTypes.UPDATE_CELL,
        columnId,
        rowIndex,
        value: value?.id ?? null,
      });
      setIsPopoverOpen(false);
    },
    [columnId, dataDispatch, rowIndex],
  );

  const updateOptions = useCallback(
    (options: Option[]) => {
      dataDispatch({
        type: ActionTypes.UPDATE_OPTIONS,
        options,
        columnId,
      });
    },
    [columnId, dataDispatch],
  );

  const handlePopoverOpenChange = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={handlePopoverOpenChange}
    >
      <PopoverTrigger>
        <>
          <div className={style.container}>
            {selectedOption && (
              <span
                className={style.status}
                style={{
                  backgroundColor: selectedOption.color,
                  color: selectedOption.color === '#FFFFFF' ? '#A9A9AB' : '#FFFFFF',
                  borderColor: selectedOption.color === '#FFFFFF' ? '#A9A9AB' : selectedOption.color,
                }}
              >
                {selectedOption.label}
              </span>
            )}
          </div>
          <div className={cn(style.cell, { [style.active]: isPopoverOpen })} />
        </>
      </PopoverTrigger>

      <PopoverContent
        className={style.popover}
        portal
        autoFocusContent={false}
        side='bottom'
        align='start'
      >
        <StatusMenu
          value={value}
          updateValue={updateValue}
          options={options}
          updateOptions={updateOptions}
        />
      </PopoverContent>
    </Popover>
  );
};
