import { Row, flexRender, Header as ReactTableHeader } from '@tanstack/react-table';
import DraggableColumnHeader from '@widgets/editor/plugins/blocks/Table/header/DraggableColumnHeader';
import Header from '@widgets/editor/plugins/blocks/Table/header/Header';
import { TableRow } from '@widgets/editor/plugins/blocks/Table/Table.types';
import React from 'react';

export function ColumnOverlay({
  columnId,
  headers,
  rows,
  sourceTableRef,
}: {
  columnId: string;
  rows: Row<TableRow>[];
  headers: ReactTableHeader<TableRow, unknown>[];
  sourceTableRef: React.RefObject<HTMLTableElement>;
}) {
  const header = headers.find((header) => header.id === columnId);
  if (!header) return null;

  const rowHeights: number[] = [];
  if (sourceTableRef.current) {
    const sourceRows = sourceTableRef.current.querySelectorAll('tbody tr');
    sourceRows.forEach((row) => {
      rowHeights.push(row.getBoundingClientRect().height);
    });
  }

  return (
    <table>
      <thead>
        <tr>
          <DraggableColumnHeader
            column={header.column}
            permanent
          />
        </tr>
        <tr>
          <th className='border border-primaryHover bg-[#CFDFFF]  p-0'>
            <Header header={header} />
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row: Row<TableRow>, index) => {
          const cell = row.getAllCells().find((c) => c.column.id === columnId);
          if (!cell) return null;
          return (
            <tr key={row.id}>
              <td
                key={cell.id}
                className='border relative border-primaryHover bg-[#CFDFFF]'
                style={{ height: `${rowHeights[index]}px` }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
