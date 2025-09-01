import { ITask } from '@widgets/task-board/types';
import BodyCellContent from '../../base-cells/BodyCellContent';
import { TaskAssignProperty } from '@widgets/task-board/components/properties/assignee/task-assign-property';
import { isVirtualTask } from '../../../list-table.model';
import { getColumnMeta } from '../../../utils/getColumnMeta';
import { CellContext } from '../../../types';

function AssignTaskBodyCell(props: CellContext<ITask, ITask>) {
  const isVirtual = isVirtualTask(props.cell.row.original);
  const columnMeta = getColumnMeta(props.column);

  return (
    <BodyCellContent className={columnMeta.className}>
      <TaskAssignProperty
        disabled={isVirtual}
        task={props.getValue()}
        className='w-full'
      />
    </BodyCellContent>
  );
}

export default AssignTaskBodyCell;
