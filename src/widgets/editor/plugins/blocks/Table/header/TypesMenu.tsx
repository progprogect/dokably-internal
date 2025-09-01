import React from 'react';

import { ActionTypes, DataTypes, shortId } from '../utils';

import DataTypeIcon from './DataTypeIcon';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

function getLabel(type: DataTypes) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export const mapEnumToOptions = (enumObject: DataTypes, dataDispatch: any, columnId: string, onClose: any) =>
  Object.keys(enumObject).map((key) => ({
    value: key,
    // @ts-ignore
    type: enumObject[key],
    onClick: () => {
      dataDispatch({
        type: ActionTypes.UPDATE_COLUMN_TYPE,
        columnId,
        // @ts-ignore
        dataType: enumObject[key],
      });

      onClose();
    },
    // @ts-ignore
    icon: <DataTypeIcon dataType={enumObject[key]} />,
    // @ts-ignore
    label: getLabel(enumObject[key]),
  }));

interface SortByParam {
  id: string;
  desc: boolean;
}

interface Props {
  columnId: string;
  dataType: DataTypes;
  setShowTypeMenu: (flag: boolean) => void;
  onClose: () => void;
}

export default function TypesMenu({ setShowTypeMenu, onClose, columnId }: Props) {
  const { dataDispatch } = useTableContext();
  // @ts-ignore
  const types = mapEnumToOptions(DataTypes, dataDispatch, columnId, onClose);

  return (
    <div
      className='shadow-5 bg-white border-radius-md list-padding'
      onMouseEnter={() => setShowTypeMenu(true)}
      // onMouseLeave={() => setShowTypeMenu(false)}
    >
      {types.map((type) => (
        <button
          className='sort-button'
          onClick={type.onClick}
          key={type.label}
        >
          <span className='svg-icon svg-text icon-margin'>{type.icon}</span>
          {type.label}
        </button>
      ))}
    </div>
  );
}
