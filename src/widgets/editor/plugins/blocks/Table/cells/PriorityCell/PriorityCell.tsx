import { useCallback, useState } from 'react';
import cn from 'classnames';

import { ReactComponent as Flag } from '@icons/flag.svg';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import { Option } from '@widgets/editor/plugins/blocks/Table/Table.types';

import { ActionTypes } from '../../utils';

import { PriorityMenu } from './PriorityMenu';
import style from './style.module.scss';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

interface Props {
  columnId: string;
  rowIndex: number;
  value: string | null;
  options: Option[];
}

export const PriorityCell = ({ columnId, rowIndex, value, options }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { dataDispatch } = useTableContext();

  const selectedValue = options.find((option) => option.id === value) || null;

  const updateValue = useCallback(
    (value: Option | null) => {
      dataDispatch({
        type: ActionTypes.UPDATE_CELL,
        columnId,
        rowIndex,
        value: value?.id,
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
        <div className={cn(style.cell, { [style.active]: isPopoverOpen })}>
          {selectedValue && (
            <>
              <Flag
                stroke={selectedValue.color === '#FFFFFF' ? '#A9A9AB' : selectedValue.color}
                fill={selectedValue.color}
              />
              {selectedValue.label}
            </>
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
        <PriorityMenu
          value={value}
          updateValue={updateValue}
          options={options}
          updateOptions={updateOptions}
        />
      </PopoverContent>
    </Popover>
  );
};
