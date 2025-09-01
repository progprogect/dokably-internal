import { CellContext } from '@tanstack/react-table';
import { ITask } from '@widgets/task-board/types';
import BodyCellContent from '../../base-cells/BodyCellContent';
import { TaskStatusProperty } from '@widgets/task-board/components/properties/status/task-status-property';
import { isVirtualTask } from '../../../list-table.model';
import { getColumnMeta } from '../../../utils/getColumnMeta';
import { cn } from '@app/utils/cn';

function TaskStatusBodyCell(props: CellContext<ITask, ITask>) {
  const isVirtual = isVirtualTask(props.cell.row.original);
  const columnMeta = getColumnMeta(props.column);

  return (
    <BodyCellContent
      className={cn('text-text', columnMeta.className)}
      $contentAlign='center'
    >
      <TaskStatusProperty
        disabled={isVirtual}
        task={props.getValue()}
      />
    </BodyCellContent>
  );
}

export default TaskStatusBodyCell;
