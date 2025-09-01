import { CellContext } from '@tanstack/react-table';
import { ITask } from '@widgets/task-board/types';
import BodyCellContent from '../../base-cells/BodyCellContent';
import { isVirtualTask } from '../../../list-table.model';
import TaskActions from '../../features/TaskActions';
import { getColumnMeta } from '../../../utils/getColumnMeta';
import { ActionsColumnMeta } from '../../../types';
import { useState } from 'react';
import IconButton from '@shared/uikit/icon-button';
import { ReactComponent as MoreButtonIcon } from '@images/icons/more.svg';

function TaskActionsBodyCell(props: CellContext<ITask, ITask>) {
  const isVirtual = isVirtualTask(props.cell.row.original);
  const columnMeta = getColumnMeta<ITask, ActionsColumnMeta>(props.column);
  const [open, setOpen] = useState<boolean>(false);

  return (
    <BodyCellContent className={columnMeta.className}>
      <TaskActions
        open={open}
        onOpenChange={setOpen}
        task={props.row.original}
        trigger={
          <IconButton
            disabled={isVirtual}
            active={open}
            variant='transparent'
            aria-label='Show task actions popup'
            className={!open ? columnMeta.hideContentClassName : ''}
          >
            <MoreButtonIcon />
          </IconButton>
        }
      />
    </BodyCellContent>
  );
}

export default TaskActionsBodyCell;
