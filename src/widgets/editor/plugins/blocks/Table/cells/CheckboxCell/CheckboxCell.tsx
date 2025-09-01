import React, { useEffect, useState } from 'react';

import { ActionTypes } from '../../utils';

import cssStyles from './style.module.scss';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

interface Props {
  value: boolean;
  columnId: string;
  rowIndex: number;
}

export const CheckboxCell = ({ value, columnId, rowIndex }: Props) => {
  const [cellValue, setCellValue] = useState({
    value: value,
    update: false,
  });
  const { dataDispatch } = useTableContext();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCellValue({ value: e.target.checked, update: false });

    dataDispatch({
      type: ActionTypes.UPDATE_CELL,
      columnId,
      rowIndex,
      value: e.target.checked,
    });
  }

  useEffect(() => {
    setCellValue({ value: value, update: false });
  }, [value]);

  useEffect(() => {
    if (cellValue.update) {
      dataDispatch({
        type: ActionTypes.UPDATE_CELL,
        columnId,
        rowIndex,
        value: cellValue.value,
      });
    }
  }, [cellValue.update, columnId, rowIndex]);

  return (
    <div className={cssStyles.root}>
      <input
        type='checkbox'
        onChange={onChange}
        checked={cellValue.value}
      />
    </div>
  );
};
