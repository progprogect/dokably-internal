import { CellContext } from '@tanstack/react-table';
import { ITask } from '@widgets/task-board/types';
import BodyCellContent from '../../base-cells/BodyCellContent';
import { isVirtualTask } from '../../../list-table.model';
import { getColumnMeta } from '../../../utils/getColumnMeta';
import DatePicker from '@widgets/task-board/components/shared/date-picker';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { cn } from '@app/utils/cn';

function DueDateBodyCell(context: CellContext<ITask, Date | number | null>) {
  const isVirtual = isVirtualTask(context.cell.row.original);
  const columnMeta = getColumnMeta(context.column);
  const { updateTaskDueDate } = useTaskBoard();
  const task = context.row.original;
  const value = context.getValue();

  const handleDateChange = (newDate: Date | null) => {
    updateTaskDueDate(task.id, context.column.id, newDate);
  };

  return (
    <BodyCellContent
      style={{ overflow: "hidden", display: "flex", justifyContent: "flex-start" }}
      className={cn(columnMeta.className, 'text-text')}
    >
      <DatePicker
        disabled={isVirtual}
        value={value ?? null}
        onChange={handleDateChange}
      />
    </BodyCellContent>
  );
}

export default DueDateBodyCell;
