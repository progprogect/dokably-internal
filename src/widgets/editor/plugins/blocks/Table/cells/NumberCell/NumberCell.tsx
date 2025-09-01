import React, { useCallback, useState } from 'react';
import { ActionTypes, DataNumberTypes, DataTypes } from '../../utils';
import inputStyles from '../TextCell/style.module.scss';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { cn } from '@app/utils/cn';

interface Props {
  dataType: DataTypes | DataNumberTypes;
  value: string;
  columnId: string;
  rowIndex: number;
}

export default function NumberCell({ dataType, value, columnId, rowIndex }: Props) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { dataDispatch, focusTable } = useTableContext();

  const getFormat = (dataType: DataTypes | DataNumberTypes): string => {
    switch (dataType) {
      case DataNumberTypes.US_DOLLAR:
        return '$';
      case DataNumberTypes.EURO:
        return '€';
      case DataNumberTypes.POUND:
        return '£';
      case DataNumberTypes.PERCENT:
        return '%';
      default:
        return '';
    }
  };

  const getLabel = useCallback(
    (value: string): string => {
      const valueIsEmpty = !value?.length || value === '<br>';
      const typeIsPercent = dataType === DataNumberTypes.PERCENT;
      const format = isEditing ? '' : getFormat(dataType);
      return valueIsEmpty ? '' : `${typeIsPercent ? '' : format}${value}${typeIsPercent ? format : ''}`;
    },
    [dataType, isEditing],
  );

  const onChange = (e: ContentEditableEvent) => {
    dataDispatch({
      type: ActionTypes.UPDATE_CELL,
      columnId,
      rowIndex,
      value: e.target.value,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    focusTable();
    e.stopPropagation();
  };

  const handleFocusInput = (e: React.FocusEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlurInput = (e: React.FocusEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!e.code.includes('Digit') && e.code !== 'Backspace' && e.code !== 'Period') {
      e.preventDefault();
    }

    if (e.key === 'Backspace') {
      e.stopPropagation();
    }

    if (e.key === 'Enter') {
      e.stopPropagation();
      e.preventDefault();

      (e.target as HTMLElement).blur();
    }
  };

  return (
    <>
      <ContentEditable
        html={value || ''}
        onChange={onChange}
        className={cn(inputStyles.placeholder)}
      />
      <ContentEditable
        html={getLabel(value)}
        onMouseDown={handleMouseDown}
        onChange={onChange}
        onFocus={handleFocusInput}
        onBlur={handleBlurInput}
        onKeyDown={handleKeyDown}
        className={cn(inputStyles.input)}
      />
    </>
  );
}
