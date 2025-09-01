import { ITask } from '@widgets/task-board/types';
import { Cell, flexRender, HeaderGroup, Row, Table as TanstackTable } from '@tanstack/react-table';
import HeaderCell from '../../base-cells/HeaderCell';
import { STATIC_COLUMNS } from '../../../list-table.model';
import TableRow from '../../table-rows/TableRow';
import { cn } from '@app/utils/cn';
import { CSSProperties } from 'react';

type TableProps = {
  table: TanstackTable<ITask>;
  renderHeader?: boolean;
  bodyRowClassName?: (({ row }: { row: Row<ITask> }) => string) | string;
  headerRowClassName?: (({ row }: { row: HeaderGroup<ITask> }) => string) | string;
  className?: string;
  style?: CSSProperties;
  bodyCellClassName?: (({ cell }: { cell: Cell<ITask, unknown> }) => string) | string;
};

function Table({
  table,
  renderHeader = true,
  className,
  style,
  bodyRowClassName,
  bodyCellClassName,
  headerRowClassName,
}: TableProps) {
  return (
    <div
      role='table'
      style={{ ...style, width: table.getCenterTotalSize() }}
      className={className}
    >
      {renderHeader && (
        <div role='rowgroup'>
          {table.getHeaderGroups().map((headerGroup) => (
            <div
              role='row'
              key={headerGroup.id}
              className={cn(
                typeof headerRowClassName === 'function'
                  ? headerRowClassName({ row: headerGroup })
                  : headerRowClassName,
              )}
            >
              {headerGroup.headers.map((header) => {
                const columnId = header.column.columnDef.id;

                return (
                  <HeaderCell
                    sticky={columnId === STATIC_COLUMNS.NAME}
                    key={header.id}
                    style={{
                      width: header.getSize(),
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </HeaderCell>
                );
              })}
            </div>
          ))}
        </div>
      )}
      <div role='rowgroup'>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.original.id}
            row={row}
            className={cn(typeof bodyRowClassName === 'function' ? bodyRowClassName({ row }) : bodyRowClassName)}
            cellClassName={bodyCellClassName}
          />
        ))}
      </div>
    </div>
  );
}

export default Table;
