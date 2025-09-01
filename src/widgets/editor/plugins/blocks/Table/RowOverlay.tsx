import { Column, flexRender, Row } from '@tanstack/react-table';
import { HANDLE } from '@widgets/editor/plugins/blocks/Table/Table.const';
import { DraggableRowHeader } from '@widgets/editor/plugins/blocks/Table/header/DraggableRowHeader';
import { TableRow } from '@widgets/editor/plugins/blocks/Table/Table.types';
import classNames from 'classnames';
import React from 'react';

export function RowOverlay({
  rowId,
  rows,
  sourceTableRef,
}: {
  rowId: string;
  rows: Row<TableRow>[];
  columns: Column<TableRow, unknown>[];
  sourceTableRef: React.RefObject<HTMLTableElement>;
}) {
  const row = rows.find((row) => row.original.id === rowId);

  if (!row) return null;

  const colWidth: number[] = [];
  if (sourceTableRef.current) {
    const sourceCols = Array.from(sourceTableRef.current.querySelectorAll('thead tr'))?.shift()?.querySelectorAll('th');

    if (!sourceCols) return null;
    sourceCols.forEach((col) => {
      colWidth.push(col.getBoundingClientRect().width);
    });
  }

  return (
    <div
      style={{
        overflow: 'hidden',
        maxWidth: '746px',
        width: 'fit-content',
      }}
    >
      <table style={{ tableLayout: 'fixed', width: '100%' }}>
        <thead>
          <tr>
            {row.getAllCells().map((cell, index) => {
              return (
                <th
                  key={cell.id}
                  className='p-0'
                  style={{ width: `${colWidth[index]}px` }}
                ></th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            {row.getAllCells().map((cell, index) => {
              if (cell.column.id === HANDLE) {
                return (
                  <DraggableRowHeader
                    key={cell.id}
                    row={row}
                    permanent
                  />
                );
              }
              return (
                <td
                  key={cell.id}
                  className={classNames({
                    'border relative border-primaryHover bg-[#CFDFFF]': !cell.id.includes(HANDLE),
                  })}
                  style={{ width: `${colWidth[index]}px` }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
