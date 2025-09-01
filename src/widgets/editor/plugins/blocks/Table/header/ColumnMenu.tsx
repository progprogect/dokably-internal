import React from 'react';
import { ActionTypes } from '../utils';

import DuplicateIcon from '../img/Duplicate';
import DeleteIcon from '../img/Delete';
import cssStyles from './style.module.scss';
import InsertColumnLeftIcon from '../img/InsertColumnLeft';
import InsertColumnRightIcon from '../img/InsertColumnRight';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

interface Props {
  columnId: string;
  setShowHeaderMenu: (flag: boolean) => void;
}

export const ColumnMenu = ({ columnId, setShowHeaderMenu }: Props) => {
  const { dataDispatch } = useTableContext();
  const buttons = [
    {
      onClick: () => {
        dataDispatch({
          type: ActionTypes.ADD_COLUMN_TO_LEFT,
          columnId,
          focus: false,
        });
        setShowHeaderMenu(false);
      },
      icon: <InsertColumnLeftIcon />,
      label: 'Insert column left',
    },
    {
      onClick: () => {
        dataDispatch({
          type: ActionTypes.ADD_COLUMN_TO_RIGHT,
          columnId,
          focus: false,
        });
        setShowHeaderMenu(false);
      },
      icon: <InsertColumnRightIcon />,
      label: 'Insert column right',
    },
    {
      onClick: () => {
        dataDispatch({
          type: ActionTypes.DUPLICATE_COLUMN,
          columnId,
        });
        setShowHeaderMenu(false);
      },
      icon: <DuplicateIcon />,
      label: 'Duplicate',
    },
    {
      onClick: () => {
        dataDispatch({ type: ActionTypes.DELETE_COLUMN, columnId });
        setShowHeaderMenu(false);
      },
      icon: <DeleteIcon />,
      label: 'Delete',
    },
  ];

  return (
    <div>
      <div
        className='bg-white shadow-5 border-radius-md'
        style={{
          width: 216,
        }}
      >
        <div className={cssStyles.listPadding}>
          {buttons.map((button) => (
            <button
              type='button'
              className='sort-button'
              onPointerDown={button.onClick}
              key={button.label}
            >
              <span className='svg-icon svg-text icon-margin'>{button.icon}</span>
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
