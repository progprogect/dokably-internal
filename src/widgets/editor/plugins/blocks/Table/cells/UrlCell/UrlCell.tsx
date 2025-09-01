import React, { useRef, useState } from 'react';

// import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import ReactDOM from 'react-dom';

import { ActionTypes } from '../../utils';
import usePopper from '@app/hooks/usePopper';
import { EditLinkMenu } from './editLinkMenu';
import styles from './style.module.scss';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { cn } from '@app/utils/cn';
import inputStyles from '../TextCell/style.module.scss';
import { isValidUrl } from '@shared/lib/utils/browser/isValidUrl';

interface Props {
  value: string;
  columnId: string;
  rowIndex: number;
}

const portalStyles = {
  zIndex: 6,
  minWidth: 250,
  padding: '8px',
  overflow: 'hidden',
};

export const UrlCell = ({ value, columnId, rowIndex }: Props) => {
  const { portalId, dataDispatch, focusTable } = useTableContext();
  // const [isEditable, setIsEditable] = useState<boolean>(!value);
  const [editPopupIsVisible, setEditPopupIsVisible] = useState(false);
  const [referenceElement, setReferenceElement] = useState(null);
  const inputRef = useRef<any>();

  const urlIsValid = !!value && isValidUrl(value);

  const changeValue = (value: string) => {
    dataDispatch({
      type: ActionTypes.UPDATE_CELL,
      columnId,
      rowIndex,
      value,
    });
  };

  const onChange = (e: ContentEditableEvent) => {
    changeValue(e.target.value);
  };

  const onDelete = () => {
    changeValue('');
    setEditPopupIsVisible(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    focusTable();
    e.stopPropagation();
    if (urlIsValid) {
      setEditPopupIsVisible((value) => !value);
    }
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
      if (e.key === 'Enter') {
        inputRef.current.blur();
        setEditPopupIsVisible(false);
      }
    }
  };

  const popover = usePopper({
    portalId,
    referenceElement,
    externalStyles: portalStyles,
    placement: 'top-start',
    children: (
      <EditLinkMenu
        value={value}
        urlIsValid={urlIsValid}
        onDelete={onDelete}
      />
    ),
  });

  return (
    <>
      {editPopupIsVisible &&
        ReactDOM.createPortal(
          <div
            className={styles.overlay}
            onClick={() => setEditPopupIsVisible(false)}
          />,
          document.body,
        )}
      <ContentEditable
        innerRef={setReferenceElement}
        html={value || ''}
        onChange={onChange}
        className={cn(inputStyles.placeholder)}
      />
      <ContentEditable
        innerRef={inputRef}
        html={value || ''}
        style={{
          color: urlIsValid ? '#2554F6' : '#424242',
          textDecoration: urlIsValid ? 'underline' : 'none',
        }}
        onMouseDown={handleMouseDown}
        onChange={onChange}
        onFocus={handleFocusInput}
        onBlur={handleBlurInput}
        onKeyDown={handleKeyDown}
        className={cn(inputStyles.input)}
      />
      {editPopupIsVisible && popover}
    </>
  );
};
