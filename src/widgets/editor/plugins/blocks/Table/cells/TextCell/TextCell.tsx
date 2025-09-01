// TextCell.tsx
import React from 'react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { ActionTypes } from '../../utils';
import cn from 'classnames';
import style from './style.module.scss';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

interface Props {
  value?: string;
  columnId: string;
  rowIndex: number;
}

export const TextCell = ({ value, columnId, rowIndex }: Props) => {
  const { dataDispatch, focusTable } = useTableContext();

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
  };

  const handleBlurInput = (e: React.FocusEvent) => {
    e.stopPropagation();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Backspace') {
      e.stopPropagation();
    }
  };

  return (
    <>
      <ContentEditable
        html={value || ''}
        onChange={onChange}
        className={cn(style.placeholder)}
      />
      <ContentEditable
        html={value || ''}
        onMouseDown={handleMouseDown}
        onChange={onChange}
        onFocus={handleFocusInput}
        onBlur={handleBlurInput}
        onKeyDown={handleKeyDown}
        className={cn(style.input)}
      />
    </>
  );
};
