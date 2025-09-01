import React from 'react';
import { ReactComponent as MoreButtonIcon } from '@images/icons/more.svg';

import { cn } from '@app/utils/cn';
import { isVirtualTask } from '../../list-table.model';

import styles from './styles.module.scss';
import { getTableMeta } from '../../utils/getTableMeta';
import { ITask } from '@widgets/task-board/types';
import { CellContext, TableMeta } from '../../types';
import TaskActions from '../../components/features/TaskActions';

function WithActionButtonBodyCell(
  Cell: React.ComponentType<CellContext<ITask, string>>,
  options?: { className?: string; classNameIcon?: string },
) {
  return function BodyCell(context: CellContext<ITask, string>) {
    const tableMeta = getTableMeta<ITask, TableMeta>(context.table);
    const isVirtual = isVirtualTask(context.cell.row.original);
    const dragableRowContext = context.$rowContext?.draggable;

    const handleOpen = (open: boolean) => {
      if (!open) tableMeta.actionsCell.onOpen(null);
    };

    const open = tableMeta.actionsCell.open === context.row.original;
    const draggableOptions = {
      ...dragableRowContext?.attributes,
      ...dragableRowContext?.listeners,
    };

    return (
      <>
        <button
          {...(!isVirtual && context.row.depth === 0 ? draggableOptions : {})}
          ref={dragableRowContext?.setActivatorNodeRef}
          type='button'
          className={cn(
            styles['action-button'],
            { [styles.active]: open || tableMeta.draggable?.active },
            options?.className,
          )}
          onMouseUp={() => {
            tableMeta.actionsCell.onOpen(context.row.original);
          }}
        >
          <MoreButtonIcon className={cn(styles.icon, options?.classNameIcon)} />
        </button>
        {!isVirtual && open && (
          <TaskActions
            open={open}
            onOpenChange={handleOpen}
            task={context.row.original}
            trigger={<button className='invisible absolute h-full w-full' />}
          />
        )}
        <Cell {...context} />
      </>
    );
  };
}
export default WithActionButtonBodyCell;
