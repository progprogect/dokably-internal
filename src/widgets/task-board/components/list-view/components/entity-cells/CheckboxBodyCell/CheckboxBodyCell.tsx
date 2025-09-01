import { CellContext } from '@tanstack/react-table';
import { ITask } from '@widgets/task-board/types';
import BodyCellContent from '../../base-cells/BodyCellContent';
import { getColumnMeta } from '../../../utils/getColumnMeta';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import InputText from '../../shared/InputText';

function CheckboxBodyCell(context: CellContext<ITask, boolean | undefined>) {
  // const isVirtual = isVirtualTask(context.cell.row.original);
  const columnMeta = getColumnMeta(context.column);
  const { updateTaskCheckbox } = useTaskBoard();
  const value = context.getValue();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTaskCheckbox(context.row.original.id, context.column.id, e.target.checked);
  };

  return (
    <BodyCellContent className={columnMeta.className}>
      <InputText
        className='checkbox-input'
        type='checkbox'
        checked={value}
        onChange={handleChange}
      />
    </BodyCellContent>
  );
}

export default CheckboxBodyCell;
