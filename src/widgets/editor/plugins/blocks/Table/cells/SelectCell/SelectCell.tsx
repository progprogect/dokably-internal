import { useCallback, useState, MouseEvent } from 'react';
import cn from 'classnames';

import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import { Option } from '@widgets/editor/plugins/blocks/Table/Table.types';

import { ActionTypes } from '../../utils';
import { X } from 'lucide-react';

import { SelectMenu } from './SelectMenu';
import style from './style.module.scss';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

interface Props {
  columnId: string;
  rowIndex: number;
  value: string[] | null;
  options: Option[];
}

export const SelectCell = ({ columnId, rowIndex, value, options }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { dataDispatch } = useTableContext();

  const selectedValues = options.filter((option) => value?.includes(option.id)) ?? [];

  const updateValue = useCallback(
    (value: Option[] | null) => {
      dataDispatch({
        type: ActionTypes.UPDATE_CELL,
        columnId,
        rowIndex,
        value: value?.map((option) => option.id) || [],
      });
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

  const handleRemoveSelection = (e: MouseEvent<SVGSVGElement>, option: Option) => {
    e.stopPropagation();

    if (selectedValues.length > 0) {
      updateValue(selectedValues.filter((item) => item.id !== option.id));
    }
  };

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={handlePopoverOpenChange}
    >
      <PopoverTrigger>
        <>
          <div className={cn(style.cell, { [style.active]: isPopoverOpen })} />
          <div className={style.container}>
            {selectedValues &&
              selectedValues.map((value) => (
                <span
                  key={value.id}
                  className={style.status}
                  style={{
                    backgroundColor: value.color,
                    color: value.color === '#FFFFFF' ? '#A9A9AB' : '#FFFFFF',
                    borderColor: value.color === '#FFFFFF' ? '#A9A9AB' : value.color,
                  }}
                >
                  <span>{value.label}</span>
                  <X
                    className={style.remove}
                    size={16}
                    onClick={(e) => handleRemoveSelection(e, value)}
                  />
                </span>
              ))}
          </div>
        </>
      </PopoverTrigger>

      <PopoverContent
        className={style.popover}
        portal
        autoFocusContent={false}
        side='bottom'
        align='start'
      >
        <SelectMenu
          value={selectedValues}
          updateValue={updateValue}
          options={options}
          updateOptions={updateOptions}
        />
      </PopoverContent>
    </Popover>
  );
};
