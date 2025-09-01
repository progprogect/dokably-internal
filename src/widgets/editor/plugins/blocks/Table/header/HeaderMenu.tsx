import React, { KeyboardEvent, useEffect, useState } from 'react';

import { grey } from '../colors';
import ArrowDownIcon from '../img/ArrowDown';
import ArrowLeftIcon from '../img/ArrowLeft';
import ArrowRightIcon from '../img/ArrowRight';
import ArrowUpIcon from '../img/ArrowUp';
import TrashIcon from '../img/Trash';

import { ActionTypes, DataNumberTypes, DataTypes, shortId } from '../utils';

import DataTypeIcon from './DataTypeIcon';
import TypesMenu from './TypesMenu';
import usePopper from '@app/hooks/usePopper';
import NumberFormatMenu from './NumberFormatMenu';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

interface ColumnCallback {
  newColumnId?: string;
}

interface Props {
  label: string;
  dataType: DataTypes;
  columnId: string;
  setShowHeaderMenu: (flag: boolean) => void;
}

const portalStyles = {
  zIndex: 4,
  minWidth: 200,
  maxWidth: 520,
  maxHeight: 400,
};

export const HeaderMenu = ({ label, dataType, columnId, setShowHeaderMenu }: Props) => {
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [header, setHeader] = useState(label);

  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [numberFormatElement, setNumberFormatElement] = useState<HTMLDivElement | null>(null);

  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showNumberFormatMenu, setShowNumberFormatMenu] = useState(false);

  const { dataDispatch, portalId } = useTableContext();

  function getLabel(type: DataTypes) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  function onTypeMenuClose() {
    setShowTypeMenu(false);
    setShowHeaderMenu(false);
  }

  function onNumberFormatMenuClose() {
    setShowNumberFormatMenu(false);
    setShowHeaderMenu(false);
  }

  useEffect(() => {
    setHeader(label);
  }, [label]);

  useEffect(() => {
    if (inputRef) {
      inputRef.focus();
      inputRef.select();
    }
  }, [inputRef]);

  const buttons = [
    {
      onClick: () => {
        dataDispatch({
          type: ActionTypes.UPDATE_SORTING_BY_COLUMN,
          columnId,
          sortType: 'asc',
        });
        setShowHeaderMenu(false);
      },
      icon: <ArrowUpIcon />,
      label: 'Sort ascending',
    },
    {
      onClick: () => {
        dataDispatch({
          type: ActionTypes.UPDATE_SORTING_BY_COLUMN,
          columnId,
          sortType: 'desc',
        });
        setShowHeaderMenu(false);
      },
      icon: <ArrowDownIcon />,
      label: 'Sort descending',
    },
    {
      onClick: () => {
        const callbackRef: ColumnCallback = {};
        dataDispatch({
          type: ActionTypes.UPDATE_COLUMN_HEADER,
          columnId,
          label: header,
        });
        dataDispatch({
          type: ActionTypes.ADD_COLUMN_TO_LEFT,
          columnId,
          focus: false,
          callbackRef,
        });
        setShowHeaderMenu(false);
      },
      icon: <ArrowLeftIcon />,
      label: 'Insert left',
    },
    {
      onClick: () => {
        const callbackRef: ColumnCallback = {};
        dataDispatch({
          type: ActionTypes.UPDATE_COLUMN_HEADER,
          columnId,
          label: header,
        });
        dataDispatch({
          type: ActionTypes.ADD_COLUMN_TO_RIGHT,
          columnId,
          focus: false,
          callbackRef,
        });
        setShowHeaderMenu(false);
      },
      icon: <ArrowRightIcon />,
      label: 'Insert right',
    },
    {
      onClick: () => {
        dataDispatch({ type: ActionTypes.DELETE_COLUMN, columnId });
        setShowHeaderMenu(false);
      },
      icon: <TrashIcon />,
      label: 'Delete',
    },
  ];

  function handleColumnNameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      dataDispatch({
        type: ActionTypes.UPDATE_COLUMN_HEADER,
        columnId,
        label: header,
      });
      setShowHeaderMenu(false);
    }
  }

  function handleColumnNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setHeader(e.target.value);
  }

  function handleColumnNameBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.preventDefault();
    dataDispatch({
      type: ActionTypes.UPDATE_COLUMN_HEADER,
      columnId,
      label: header,
    });
  }

  const isNumberType = (dataType: DataTypes | DataNumberTypes) => {
    if (dataType === DataTypes.NUMBER || Object.values(DataNumberTypes).includes(dataType as DataNumberTypes)) {
      return true;
    }
    return false;
  };

  const typesMenuPopover = usePopper({
    portalId,
    referenceElement,
    externalStyles: portalStyles,
    placement: 'right-start',
    children: (
      <TypesMenu
        dataType={dataType}
        onClose={onTypeMenuClose}
        setShowTypeMenu={setShowTypeMenu}
        columnId={columnId}
      />
    ),
  });

  const numberFormatPopover = usePopper({
    portalId,
    referenceElement: numberFormatElement,
    externalStyles: { ...portalStyles, zIndex: 5 },
    placement: 'right-start',
    children: (
      <NumberFormatMenu
        onClose={onNumberFormatMenuClose}
        columnId={columnId}
      />
    ),
  });

  const getArrowIcon = (isShow: boolean) =>
    isShow ? (
      <ChevronRightIcon
        width={16}
        height={16}
      />
    ) : (
      <ChevronDownIcon
        width={16}
        height={16}
      />
    );

  return (
    <div>
      <div
        className='bg-white shadow-5 border-radius-md'
        style={{
          width: 240,
        }}
      >
        <div
          style={{
            paddingTop: '0.75rem',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
          }}
        >
          <div
            className='is-fullwidth'
            style={{ marginBottom: 12 }}
          >
            <input
              className='form-input is-fullwidth'
              ref={setInputRef}
              type='text'
              value={header}
              onChange={handleColumnNameChange}
              onBlur={handleColumnNameBlur}
              onKeyDown={handleColumnNameKeyDown}
            />
          </div>
          <span className='font-weight-600 font-size-75 color-grey-500 text-transform-uppercase'>Property Type</span>
        </div>
        <div className='list-padding'>
          <button
            className='sort-button flex justify-between'
            type='button'
            // onMouseEnter={() => setShowTypeMenu(true)}
            // onMouseLeave={() => setShowTypeMenu(false)}
            onMouseUp={() => {
              setShowTypeMenu((value) => !value);
              setShowNumberFormatMenu(false);
            }}
            // @ts-ignore
            ref={setReferenceElement}
          >
            <span className='flex items-center'>
              <span className='svg-icon svg-text icon-margin'>
                <DataTypeIcon dataType={dataType} />
              </span>
              <span>{getLabel(dataType)}</span>
            </span>
            <span>{getArrowIcon(showTypeMenu)}</span>
          </button>
          {showTypeMenu && typesMenuPopover}
        </div>
        {isNumberType(dataType) && (
          <div className='list-padding'>
            <button
              className='sort-button flex justify-between'
              type='button'
              // onMouseEnter={() => setShowNumberFormatMenu(true)}
              // onMouseLeave={() => setShowNumberFormatMenu(false)}
              onMouseUp={() => {
                setShowNumberFormatMenu((value) => !value);
                setShowTypeMenu(false);
              }}
              // @ts-ignore
              ref={setNumberFormatElement}
            >
              <span>Number format</span>
              <span>{getArrowIcon(showNumberFormatMenu)}</span>
            </button>
            {showNumberFormatMenu && numberFormatPopover}
          </div>
        )}
        <div style={{ borderTop: `2px solid ${grey(200)}` }} />
        <div className='list-padding'>
          {buttons.map((button) => (
            <button
              type='button'
              className='sort-button'
              onMouseDown={button.onClick}
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
