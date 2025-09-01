import { CellContext } from '@tanstack/react-table';
import { ITask } from '@widgets/task-board/types';

import BodyCellContent from '../../base-cells/BodyCellContent';
import UpdateTaskText from '../../features/UpdateTaskText';

function TaskTextBodyCell(props: CellContext<ITask, string>) {
  const initialValue = props.getValue();

  return (
    <BodyCellContent
      className='text-text'
      $contentAlign='start'
    >
      <UpdateTaskText
        defaultValue={initialValue}
        task={props.cell.row.original}
        propertyId={props.column.id}
      />
    </BodyCellContent>
  );
}

export default TaskTextBodyCell;
