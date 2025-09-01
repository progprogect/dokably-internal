import { CellContext } from '@tanstack/react-table';
import { IProperty, ITask } from '@widgets/task-board/types';
import BodyCellContent from '../../base-cells/BodyCellContent';
import { getColumnMeta } from '../../../utils/getColumnMeta';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { createRef, KeyboardEvent, useEffect, useState } from 'react';
import InputText from '../../shared/InputText';

function TextBodyCell(context: CellContext<ITask, string | undefined>) {
  const inputRef = createRef<HTMLInputElement>();
  const initValue = context.getValue();
  const [value, setValue] = useState<string>(initValue ?? '');
  // const isVirtual = isVirtualTask(context.cell.row.original);
  const columnMeta = getColumnMeta(context.column);
  const { updateTaskText } = useTaskBoard();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTaskText(context.row.original.id, context.column.id, e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    if (initValue && value !== initValue) setValue(initValue);
  }, [initValue]);

  return (
    <BodyCellContent className={columnMeta.className}>
      <InputText
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </BodyCellContent>
  );
}

export default TextBodyCell;
