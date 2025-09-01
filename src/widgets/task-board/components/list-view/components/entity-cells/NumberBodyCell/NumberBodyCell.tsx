import { CellContext } from '@tanstack/react-table';
import { ITask } from '@widgets/task-board/types';
import BodyCellContent from '../../base-cells/BodyCellContent';
import { getColumnMeta } from '../../../utils/getColumnMeta';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { createRef, KeyboardEvent, useState } from 'react';
import InputText from '../../shared/InputText';

function NumberBodyCell(context: CellContext<ITask, string | undefined>) {
  const inputRef = createRef<HTMLInputElement>();
  const [value, setValue] = useState<string>(context.getValue() ?? '');
  // const isVirtual = isVirtualTask(context.cell.row.original);
  const columnMeta = getColumnMeta(context.column);
  const { updateTaskNumber } = useTaskBoard();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTaskNumber(context.row.original.id, context.column.id, Number(e.target.value));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <BodyCellContent className={columnMeta.className}>
      <InputText
        ref={inputRef}
        type='number'
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {/* @TODO: add suffix  */}
    </BodyCellContent>
  );
}

export default NumberBodyCell;
