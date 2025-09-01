import { Cell, flexRender, Row } from '@tanstack/react-table';
import { ITask } from '@widgets/task-board/types';
import { CSS } from '@dnd-kit/utilities';
import BodyCell from '../../base-cells/BodyCell';
import { STATIC_COLUMNS } from '../../../list-table.model';
import { useSortable } from '@dnd-kit/sortable';
import { CSSProperties } from 'react';
import styles from './styles.module.scss';

type TableRowProps = {
  row: Row<ITask>;
  className?: string;
  cellClassName?: (({ cell }: { cell: Cell<ITask, unknown> }) => string) | string;
};

function TableRow({ row, className, cellClassName }: TableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, active, setActivatorNodeRef } = useSortable({
    id: row.original.id,
    data: {
      unit: row.original,
    },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isActive = active?.id === row.original.id;

  return (
    <div
      role='row'
      ref={setNodeRef}
      className={className}
      tabIndex={0}
      style={style}
      key={row.id}
    >
      {row.getVisibleCells().map((cell) => {
        const colid = cell.column.columnDef.id;

        return isActive ? (
          <div
            key={cell.id}
            role='cell'
            className={styles['drag-indicator-cell']}
            style={{
              width: cell.column.getSize(),
              maxWidth: cell.column.columnDef.maxSize,
            }}
          />
        ) : (
          <BodyCell
            sticky={colid === STATIC_COLUMNS.NAME}
            className={typeof cellClassName === 'function' ? cellClassName?.({ cell }) : cellClassName}
            key={cell.id}
            style={{
              width: cell.column.getSize(),
              maxWidth: cell.column.columnDef.maxSize,
            }}
          >
            {flexRender(cell.column.columnDef.cell, {
              ...cell.getContext(),
              $rowContext: {
                draggable: {
                  setActivatorNodeRef,
                  listeners,
                  attributes,
                },
              },
            })}
          </BodyCell>
        );
      })}
    </div>
  );
}

export default TableRow;
