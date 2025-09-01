import { CellContext } from '@tanstack/react-table';
import { ITask } from '@widgets/task-board/types';
import BodyCellContent from '../../base-cells/BodyCellContent';
import { getColumnMeta } from '../../../utils/getColumnMeta';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import InputText from '../../shared/InputText';
import { createRef, KeyboardEvent, useEffect, useState } from 'react';
import Tooltip from '@shared/uikit/tooltip';
import ExternalLink from '@widgets/editor/plugins/blocks/Table/img/ExternalLink';
import styles from './styles.module.scss';

function EmailBodyCell(context: CellContext<ITask, string | undefined>) {
  // const isVirtual = isVirtualTask(context.cell.row.original);
  const inputRef = createRef<HTMLInputElement>();
  const [value, setValue] = useState<string>(context.getValue() ?? '');
  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);

  const columnMeta = getColumnMeta(context.column);
  const { updateTaskEmail } = useTaskBoard();

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validateValue = (value: string) => {
    const emailIsValid = validateEmail(value);
    setEmailIsValid(emailIsValid);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    updateTaskEmail(context.row.original.id, context.column.id, value);
    validateValue(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Backspace') {
      e.stopPropagation();
      if (e.key === 'Enter') {
        inputRef.current?.blur();
      }
    }
  };

  useEffect(() => validateValue(value), []);

  return (
    <BodyCellContent className={columnMeta.className}>
      <InputText
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{ textDecoration: emailIsValid ? 'underline' : 'none' }}
      />
      {emailIsValid && (
        <div className={styles.mailIcon}>
          <Tooltip content='Open in mail'>
            <a href={`mailto:${value}`}>
              <ExternalLink />
            </a>
          </Tooltip>
        </div>
      )}
    </BodyCellContent>
  );
}

export default EmailBodyCell;
