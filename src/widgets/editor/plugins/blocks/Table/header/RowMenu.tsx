import React from 'react';
import { ActionTypes } from '../utils';

import DuplicateIcon from '../img/Duplicate';
import DeleteIcon from '../img/Delete';
// import MergeCellIcon from '../img/MergeCells';
import InsertRowBelowIcon from '../img/InsertRowBelow';
// import HeaderRowIcon from '../img/HeaderRow';
import InsertRowAboveIcon from '../img/InsertRowAbove';
import cssStyles from './style.module.scss';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

interface Props {
  rowId: string;
  setShowHeaderMenu: (flag: boolean) => void;
}

export const RowMenu = ({ rowId, setShowHeaderMenu }: Props) => {
  const { dataDispatch } = useTableContext();

  const buttons = [
    // {
    //   onClick: () => {
    // 		// TODO
    //     dataDispatch({ type: ActionTypes.SET_HEADER_ROW, rowId });
    //     setShowHeaderMenu(false);
    //   },
    //   icon: <HeaderRowIcon />,
    //   label: 'Header row',
    // },
    {
      onClick: () => {
        dataDispatch({ type: ActionTypes.ADD_ROW_ABOVE, rowId });
        setShowHeaderMenu(false);
      },
      icon: <InsertRowAboveIcon />,
      label: 'Insert row above',
    },
    {
      onClick: () => {
        dataDispatch({ type: ActionTypes.ADD_ROW_BELOW, rowId });
        setShowHeaderMenu(false);
      },
      icon: <InsertRowBelowIcon />,
      label: 'Insert row below',
    },
    // {
    //   onClick: () => {
    // 		// TODO
    //     dataDispatch({ type: ActionTypes.MERGE_CELLS_ROW, rowId });
    //     setShowHeaderMenu(false);
    //   },
    //   icon: <MergeCellIcon />,
    //   label: 'Merge cells',
    // },
    {
      onClick: () => {
        dataDispatch({ type: ActionTypes.DUPLICATE_ROW, rowId });
        setShowHeaderMenu(false);
      },
      icon: <DuplicateIcon />,
      label: 'Duplicate',
    },
    {
      onClick: () => {
        dataDispatch({ type: ActionTypes.DELETE_ROW, rowId });
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
