import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  Row,
  getSortedRowModel,
  Column,
} from '@tanstack/react-table';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensors,
  useSensor,
  closestCenter,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragOverlay,
  MouseSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { ActionTypes } from '@widgets/editor/plugins/blocks/Table/utils';
import { restrictToHorizontalAxis, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { TableRow } from './Table.types';
import { DraggableRowHeader } from '@widgets/editor/plugins/blocks/Table/header/DraggableRowHeader';
import Header from '@widgets/editor/plugins/blocks/Table/header/Header';
import { DraggableColumnHeader } from '@widgets/editor/plugins/blocks/Table/header/DraggableColumnHeader';
import Cell from '@widgets/editor/plugins/blocks/Table/cells/Cell';
import { ColumnOverlay } from '@widgets/editor/plugins/blocks/Table/ColumnOverlay';
import classNames from 'classnames';
import { RowOverlay } from '@widgets/editor/plugins/blocks/Table/RowOverlay';
import { HANDLE } from '@widgets/editor/plugins/blocks/Table/Table.const';
import PlusIcon from './img/Plus';
import styles from './Table.module.scss';
import Tippy from '@tippyjs/react';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

const Table = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [hoverTable, setHoverTable] = useState<boolean>(false);
  const [rowIdIsHover, setRowIdIsHover] = useState<string>('');
  const [columnIdIsHover, setColumnIdIsHover] = useState<string>('');
  const tableRef = useRef<HTMLTableElement>(null);

  const { state, dataDispatch, scrollToColumnRef } = useTableContext();
  const { columns, data, sorting } = state;

  const scrollToColumn = useCallback((columnId?: string) => {
    if (!tableRef.current) return;

    const tableWrapper = tableRef.current.parentElement;
    if (!tableWrapper) return;

    requestAnimationFrame(() => {
      if (!tableRef.current) return;
      const column = tableRef.current.querySelector(`[data-column-id="${columnId}"]`);
      if (column) {
        column.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      } else {
        tableWrapper.scrollLeft = tableWrapper.scrollWidth;
      }
    });
  }, []);

  useEffect(() => {
    if (scrollToColumnRef) {
      scrollToColumnRef.current = scrollToColumn;
    }
  }, [scrollToColumn, scrollToColumnRef]);

  useEffect(() => {
    setTimeout(() => {
      if (state.lastAddedColumnId) {
        if (state.lastAddedColumnId) {
          scrollToColumn(state.lastAddedColumnId);
        }
      }
      dataDispatch({ type: ActionTypes.SET_LAST_ADDED_COLUMN_ID, columnId: '' });
    }, 0);
  }, [state.lastAddedColumnId, scrollToColumn, dataDispatch]);

  const renderCell = useCallback(
    ({ row, column, getValue }: { row: Row<TableRow>; column: Column<TableRow>; getValue: () => any }) => {
      return (
        <Cell
          value={getValue()}
          row={row}
          column={column}
        />
      );
    },
    [],
  );

  const renderHeaderCell = useCallback(
    ({ row }: { row: Row<TableRow> }) => {
      return (
        <DraggableRowHeader
          row={row}
          rowHoverId={rowIdIsHover}
          hoverTable={hoverTable}
        />
      );
    },
    [rowIdIsHover, hoverTable],
  );

  const tableColumns = useMemo<ColumnDef<TableRow>[]>(() => {
    const handleColumn: ColumnDef<TableRow> = {
      id: HANDLE,
      header: '',
      cell: renderHeaderCell,
      enableSorting: false,
      enableHiding: false,
    };

    const userColumns: ColumnDef<TableRow>[] = columns.map((col) => ({
      id: col.id as string,
      label: col.label,
      accessorKey: col.id as string,
      dataType: col.dataType,
      options: col.options,
      size: col.size ?? 200,
      cell: renderCell,
      enableSorting: true,
      enableResizing: true,
      minSize: 50,
      maxSize: 600,
      sortType: 'alphanumericFalsyLast',
    }));

    return [handleColumn, ...userColumns];
  }, [columns, renderCell, renderHeaderCell]);

  const table = useReactTable<TableRow>({
    data,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: (newSorting) => {
      dataDispatch({
        type: ActionTypes.SET_SORTING,
        sorting: typeof newSorting === 'function' ? newSorting(sorting) : newSorting,
      });
    },

    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });

  const allColumns = table.getAllColumns();
  const { rows } = table.getRowModel();
  const { headers } = table.getHeaderGroups()[0];

  const columnReorderIds = useMemo(() => columns.map((col) => col.id), [columns]);

  const rowReorderIds = useMemo(() => data.map((row) => row.id), [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        tolerance: 5,
        delay: 100,
      },
    }),
    useSensor(KeyboardSensor),
    useSensor(MouseSensor),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id ? String(event.active.id) : null);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id ? String(event.over.id) : null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setOverId(null);

      if (!over || active.id === over.id) return;

      const activeType =
        String(active.id).startsWith('col_') || String(active.id).startsWith('row_')
          ? String(active.id).split('_')[0]
          : null;
      const overType =
        String(over.id).startsWith('col_') || String(over.id).startsWith('row_') ? String(over.id).split('_')[0] : null;

      if (!activeType || !overType) return;

      if (activeType === 'col' && overType === 'col') {
        const oldIndex = columnReorderIds.indexOf(active.id as string);
        const newIndex = columnReorderIds.indexOf(over.id as string);
        if (oldIndex === -1 || newIndex === -1) return;

        const newColumnOrder = arrayMove(columnReorderIds, oldIndex, newIndex).map((id) => id);

        dataDispatch({
          type: ActionTypes.UPDATE_COLUMN_ORDER,
          columnOrder: newColumnOrder,
        });
      }

      if (activeType === 'row' && overType === 'row') {
        const oldIndex = rowReorderIds.indexOf(active.id as string);
        const newIndex = rowReorderIds.indexOf(over.id as string);
        if (oldIndex === -1 || newIndex === -1) return;

        const newRowOrder = arrayMove(rowReorderIds, oldIndex, newIndex).map((id) => id);

        dataDispatch({
          type: ActionTypes.UPDATE_ROW_ORDER,
          rowOrder: newRowOrder,
        });
      }
    },
    [dataDispatch, columnReorderIds, rowReorderIds],
  );

  const handleAddRow = () => dataDispatch({ type: ActionTypes.ADD_ROW });

  const handleAddColumn = () => dataDispatch({ type: ActionTypes.ADD_COLUMN_TO_END });

  return (
    <div
      className={styles.tableWrapper}
      contentEditable={false}
    >
      <table
        ref={tableRef}
        onMouseOver={() => setHoverTable(true)}
        onMouseLeave={() => setHoverTable(false)}
        className='w-full'
      >
        <thead>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToHorizontalAxis]}
          >
            <SortableContext
              items={columnReorderIds}
              strategy={horizontalListSortingStrategy}
            >
              <tr>
                {allColumns.map((column) => {
                  if (column.id === HANDLE) {
                    return <th key={column.id} />;
                  }

                  return (
                    <DraggableColumnHeader
                      key={column.id}
                      column={column}
                      columnHoverId={columnIdIsHover}
                      hoverTable={hoverTable}
                    />
                  );
                })}
              </tr>
            </SortableContext>
            <DragOverlay>
              {activeId && (
                <ColumnOverlay
                  columnId={activeId}
                  headers={headers}
                  rows={rows}
                  sourceTableRef={tableRef}
                />
              )}
            </DragOverlay>

            <tr>
              {headers.map((header) => {
                const isOverColumn = overId === header.id;
                const isActiveColumn = activeId === header.id;

                if (header.id === HANDLE) {
                  return (
                    <th
                      key={header.id}
                      className='p-0 w-3.5'
                    />
                  );
                }
                return (
                  <th
                    key={header.id}
                    data-column-id={header.id}
                    className={classNames('border bg-white border-text20 p-0', {
                      'border-r-primary': isOverColumn,
                      'opacity-50 border-[#E9E9EA]': isActiveColumn,
                    })}
                  >
                    <Header header={header} />
                  </th>
                );
              })}
            </tr>
          </DndContext>
        </thead>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={rowReorderIds}
            strategy={verticalListSortingStrategy}
          >
            <tbody>
              {rows.map((row: Row<TableRow>) => {
                return (
                  <tr
                    key={row.id}
                    className='h-full min-h-[42px]'
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isOverRow = overId === row.original.id;
                      const isOverColumn = overId === cell.column.id;
                      const isActiveRow = activeId === row.original.id;
                      const isActiveColumn = activeId === cell.column.id;
                      const dataType = (cell.column.columnDef as any)?.dataType;
                      return (
                        <td
                          key={cell.id}
                          className={classNames('relative', {
                            'border border-text20 bg-white': !cell.id.includes(HANDLE),
                            'border-b-primary': isOverRow,
                            'border-r-primary': isOverColumn,
                            'opacity-50 border-[#E9E9EA]': isActiveRow || isActiveColumn,
                            [`${dataType}-field`]: dataType,
                          })}
                          onMouseOver={() => {
                            setRowIdIsHover(row.id);
                            setColumnIdIsHover(cell.column.id);
                          }}
                          onMouseLeave={() => {
                            setRowIdIsHover('');
                            setColumnIdIsHover('');
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </SortableContext>
          <DragOverlay zIndex={0}>
            {activeId && (
              <RowOverlay
                rowId={activeId}
                columns={allColumns}
                rows={rows}
                sourceTableRef={tableRef}
              />
            )}
          </DragOverlay>
        </DndContext>
      </table>
      <Tippy
        duration={0}
        delay={300}
        content={'Click to add a new column'}
        placement='right'
        className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
      >
        <div
          className={classNames(styles.addColumnWrapper, {
            [styles.addColumnWrapperHover]: hoverTable,
          })}
          onClick={handleAddColumn}
        >
          <PlusIcon />
        </div>
      </Tippy>
      <Tippy
        duration={0}
        delay={300}
        content={'Click to add a new row'}
        placement='bottom'
        className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
      >
        <div
          className={classNames(styles.addRowWrapper, {
            [styles.addRowWrapperHover]: hoverTable,
          })}
          onClick={handleAddRow}
        >
          <PlusIcon className={styles.plusIcon} />
        </div>
      </Tippy>
    </div>
  );
};

export default Table;
