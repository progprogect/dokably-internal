import React, { useState } from 'react';

import { ActionTypes, DataNumberTypes, DataTypes } from '../utils';

import DataTypeIcon from './DataTypeIcon';
import usePopper from '@app/hooks/usePopper';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

function getLabel(type: DataTypes) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export const mapEnumToOptions = (array: string[], dataDispatch: any, columnId: string, onClose: any) =>
  array.map((key) => ({
    value: key,
    // @ts-ignore
    type: DataNumberTypes[key],
    onClick: () => {
      dataDispatch({
        type: ActionTypes.UPDATE_COLUMN_TYPE,
        columnId,
        // @ts-ignore
        dataType: DataNumberTypes[key],
      });

      onClose();
    },
    // @ts-ignore
    icon: <DataTypeIcon dataType={DataNumberTypes[key]} />,
    // @ts-ignore
    label: getLabel(DataNumberTypes[key]),
  }));

interface SortByParam {
  id: string;
  desc: boolean;
}

interface Props {
  columnId: string;
  onClose: () => void;
}

const portalStyles = {
  zIndex: 6,
  minWidth: 200,
  maxWidth: 520,
  maxHeight: 400,
  top: '-10px',
  left: '-10px',
  padding: '8px',
  overflow: 'hidden',
};

export default function NumberFormatMenu({ onClose, columnId }: Props) {
  const { portalId, dataDispatch } = useTableContext();
  // @ts-ignore
  const types = mapEnumToOptions(
    Object.keys(DataNumberTypes).filter((key) => key === 'NUMBER' || key === 'PERCENT'),
    dataDispatch,
    columnId,
    onClose,
  );
  const currencies = mapEnumToOptions(
    Object.keys(DataNumberTypes).filter((key) => key === 'EURO' || key === 'US_DOLLAR' || key === 'POUND'),
    dataDispatch,
    columnId,
    onClose,
  );
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);

  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  const currencyPopover = usePopper({
    portalId,
    referenceElement,
    externalStyles: portalStyles,
    placement: 'right-start',
    children: (
      <div className='shadow-5 bg-white border-radius-md list-padding'>
        {currencies.map((type) => (
          <button
            className='sort-button'
            onClick={type.onClick}
            key={type.label}
          >
            {type.label}
          </button>
        ))}
      </div>
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
    <div className='shadow-5 bg-white border-radius-md list-padding'>
      {types.map((type) => (
        <button
          className='sort-button'
          onClick={type.onClick}
          key={type.label}
        >
          {type.label}
        </button>
      ))}
      <div className='list-padding'>
        <button
          className='sort-button flex justify-between'
          type='button'
          onMouseUp={() => setShowCurrencyMenu((value) => !value)}
          // @ts-ignore
          ref={setReferenceElement}
        >
          <span>Currency</span>
          <span>{getArrowIcon(showCurrencyMenu)}</span>
        </button>
        {showCurrencyMenu && currencyPopover}
      </div>
    </div>
  );
}
