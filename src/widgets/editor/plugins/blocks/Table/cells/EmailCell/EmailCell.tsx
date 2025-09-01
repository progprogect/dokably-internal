import React, { useRef } from 'react';

import { ActionTypes } from '../../utils';

import styles from './style.module.scss';
import inputStyles from '../TextCell/style.module.scss';
import ExternalLink from '../../img/ExternalLink';
import Tooltip from '@shared/uikit/tooltip';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { cn } from '@app/utils/cn';

interface Props {
  value: string;
  columnId: string;
  rowIndex: number;
}

export const EmailCell = ({ value, columnId, rowIndex }: Props) => {
  const { dataDispatch, focusTable } = useTableContext();
  const inputRef = useRef<any>();
  function validateEmail(email: string) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  const onChange = (e: ContentEditableEvent) => {
    dataDispatch({
      type: ActionTypes.UPDATE_CELL,
      columnId,
      rowIndex,
      value: e.target.value,
    });
  };

  const valueIsValid = validateEmail(value);

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
      if (e.key === 'Enter') inputRef.current.blur();
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
        innerRef={inputRef}
        html={value || ''}
        onMouseDown={handleMouseDown}
        onChange={onChange}
        onFocus={handleFocusInput}
        onBlur={handleBlurInput}
        onKeyDown={handleKeyDown}
        className={cn(inputStyles.input)}
        style={{ textDecoration: valueIsValid ? "underline" : "none" }}
      />
      {valueIsValid && (
        <div className={styles.mailIcon}>
          <Tooltip content='Open in mail'>
            <a href={`mailto:${value}`}>
              <ExternalLink />
            </a>
          </Tooltip>
        </div>
      )}
    </>
  );
};
