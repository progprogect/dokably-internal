import { CellContext } from '@tanstack/react-table';
import { ITask } from '@widgets/task-board/types';
import BodyCellContent from '../../base-cells/BodyCellContent';
import { getColumnMeta } from '../../../utils/getColumnMeta';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { createRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import usePopper from '@app/hooks/usePopper';
import { EditLinkMenu } from '@widgets/editor/plugins/blocks/Table/cells/UrlCell/editLinkMenu';
import styles from './styles.module.scss';
import InputText from '../../shared/InputText';

const portalStyles = {
  zIndex: 6,
  minWidth: 250,
  padding: '8px',
  overflow: 'hidden',
};

function UrlBodyCell(context: CellContext<ITask, string | undefined>) {
  // const isVirtual = isVirtualTask(context.cell.row.original);
  const portalId = 'popper-portal-taskboard';
  const initialValue = context.getValue() || '';
  const inputRef = createRef<HTMLInputElement>();
  const [value, setValue] = useState(initialValue);
  const [urlIsValid, setUrlIsValid] = useState<boolean>(false);
  const [editPopupIsVisible, setEditPopupIsVisible] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const columnMeta = getColumnMeta(context.column);
  const { updateTaskUrl } = useTaskBoard();

  function isValidHttpUrl(string: string) {
    const res = string?.match(
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
    );
    return res !== null;
  }

  const validateValue = (value: string) => {
    const urlIsValid = isValidHttpUrl(value);
    setUrlIsValid(urlIsValid);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    updateTaskUrl(context.row.original.id, context.column.id, value);
    validateValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Backspace') {
      e.stopPropagation();
      if (e.key === 'Enter') {
        inputRef.current?.blur();
      }
    }
  };

  const handleDelete = () => {
    setValue('');
    updateTaskUrl(context.row.original.id, context.column.id, '');
    setEditPopupIsVisible(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (urlIsValid) {
      setEditPopupIsVisible((value) => !value);
    }
  };

  useEffect(() => validateValue(value), []);

  const popover = usePopper({
    portalId,
    referenceElement,
    externalStyles: portalStyles,
    placement: 'top-start',
    children: (
      <EditLinkMenu
        value={value}
        urlIsValid={urlIsValid}
        onDelete={handleDelete}
      />
    ),
  });
  return (
    <BodyCellContent className={columnMeta.className}>
      {editPopupIsVisible &&
        ReactDOM.createPortal(
          <div
            className={styles.overlay}
            onClick={() => setEditPopupIsVisible(false)}
          />,
          document.body,
        )}
      <div ref={setReferenceElement} />
      <InputText
        ref={inputRef}
        value={value}
        style={{
          color: urlIsValid ? '#2554F6' : '#424242',
          textDecoration: urlIsValid ? 'underline' : 'none',
        }}
        onMouseDown={handleMouseDown}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {editPopupIsVisible && popover}
      <div id={portalId} />
    </BodyCellContent>
  );
}

export default UrlBodyCell;
