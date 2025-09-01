import { CellContext } from '@tanstack/react-table';
import { ITask } from '@widgets/task-board/types';
import BodyCellContent from '../../base-cells/BodyCellContent';
import { TaskPriorityProperty } from '@widgets/task-board/components/properties/priority/task-priority-property';
import { isVirtualTask } from '../../../list-table.model';
import { getColumnMeta } from '../../../utils/getColumnMeta';

function TaskPriorityBodyCell(props: CellContext<ITask, ITask>) {
  const isVirtual = isVirtualTask(props.cell.row.original);
  const columnMeta = getColumnMeta(props.column);

  return (
    <BodyCellContent className={columnMeta.className}>
      <TaskPriorityProperty
        disabled={isVirtual}
        task={props.getValue()}
      />
    </BodyCellContent>
  );
}

export default TaskPriorityBodyCell;
