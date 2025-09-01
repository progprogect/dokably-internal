import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import styles from './styles.module.scss';

import { cn } from '@app/utils/cn';
import { createVirtualTask, STATIC_COLUMNS, useListViewModel } from './list-table.model';
import { SetStateAction, UIEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ListTableContextProvider, { useListTableContext } from './context/ListTableContext';
import { ReactComponent as PlusIcon } from '@icons/add-task-icon.svg';
import { debounce } from 'lodash';
import { TableMeta } from './types';
import { ITask } from '@widgets/task-board/types';

// import DnDTableContext from './context/DnDTableContext';
import { closestCenter, DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, MouseSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import UnitsDndSideEffects from './context/UnitsDndSideEffects';
// import Table from './components/table/Table';
import DragOverlayTable from './components/table/DragOverlayTable';
import { useTaskSort } from '@app/queries/task/useTaskSort';
import { useTableStateFromServer } from '@widgets/task-board/hooks/useTableStateFromServer';
// import HeaderCell from './components/base-cells/HeaderCell';
import TableRow from './components/table-rows/TableRow';
import { horizontalListSortingStrategy, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToHorizontalAxis, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { DraggableHeaderCell } from './components/table-header/DraggableHeaderCell';
import { DraggableHeaderOverlay } from './components/table-header/DraggableHeaderOverlay';

type ListTableProps = {
  variant: 'list-view' | 'table-view';
};

function reorderItems<I extends { id: string; order: number }>(items: I[], source: I, target: I) {
  const itemsCopy = [...items];
  const sourceIndex = itemsCopy.findIndex((item) => item.id === source.id);
  const targetIndex = itemsCopy.findIndex((item) => item.id === target.id);

  if (sourceIndex === -1 || targetIndex === -1) return itemsCopy;

  const [sourceItem] = itemsCopy.splice(sourceIndex, 1);
  itemsCopy.splice(targetIndex, 0, sourceItem);

  return itemsCopy.map((item, index) => ({ ...item, order: index }));
}

const initialTableState: TableState = {
  expanded: {},
  columnVisibility: {},
  columnOrder: [],
  columnPinning: {},
  rowPinning: {},
  columnFilters: [],
  globalFilter: '',
  sorting: [],
  grouping: [],
  columnSizing: {},
  columnSizingInfo: {
    columnSizingStart: [],
    deltaOffset: null,
    deltaPercentage: null,
    isResizingColumn: false,
    startOffset: null,
    startSize: null,
  },
  pagination: {
    pageIndex: 0,
    pageSize: 0,
  },
  rowSelection: {},
};



function ListTable({ variant }: ListTableProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [openActionsMenu, setOpenActionsMenu] = useState<ITask | null>(null);
  const [scrollState, setScrollState] = useState<{ scrollLeft: number }>({ scrollLeft: 0 });
  const { tasks, id: boardId, setTasks } = useTaskBoard();
  const { tableState, setTableState, createPartialStateUpdater } = useTableStateFromServer(boardId);
  const { injectVirtualTasks, addVirtualTask, activeColumnActionsMenu } = useListTableContext();
  const { sortTasks } = useTaskSort(boardId);

  const [activeUnit, setActiveUnit] = useState<ITask | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const withVirtualTask = useMemo(() => injectVirtualTasks(tasks), [tasks, injectVirtualTasks]);

  const { tableModel } = useListViewModel();
  


  const handleExpandedChange = useMemo(() => createPartialStateUpdater('expanded'), [createPartialStateUpdater]);
  const handleColumnSizingChange = useMemo(() => createPartialStateUpdater('columnSizing'), [createPartialStateUpdater]);
  const handleSortingChange = useMemo(() => createPartialStateUpdater('sorting'), [createPartialStateUpdater]);
  const handleColumnOrderChange = useMemo(() => createPartialStateUpdater('columnOrder'), [createPartialStateUpdater]);

  const table = useReactTable({
    data: withVirtualTask,
    columns: tableModel,
    state: tableState,
    meta: {
      scrollState,
      actionsCell: {
        open: openActionsMenu,
        onOpen: setOpenActionsMenu,
      },
    } satisfies TableMeta,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSubRows: (row) => row.subtasks,
    filterFromLeafRows: true,
    onExpandedChange: handleExpandedChange,
    onSortingChange: handleSortingChange,
    onColumnSizingChange: handleColumnSizingChange,
    onColumnOrderChange: handleColumnOrderChange,
    enableColumnResizing: true,
  });

  const handleAddTask = () => addVirtualTask(createVirtualTask('task', null));
  const debouncedSetScrollState = debounce(setScrollState, 100);

  const handleContainerScroll = (event: UIEvent<HTMLDivElement>) => {
    debouncedSetScrollState({ scrollLeft: event.currentTarget.scrollLeft });
  };

  const handleCollapse = useCallback(
    (task: ITask) => {
      handleExpandedChange((prev) => {
        return typeof prev === 'boolean' ? { [task.id]: false } : { ...prev, [task.id]: false };
      });
    },
    [handleExpandedChange],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveUnit(event.active.data.current?.unit);
    setActiveColumnId(`${event.active?.id}`);
    // containerRef.current?.scrollTo({ left: 0 });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const source = event.active?.data.current?.unit as ITask;
    const target = event.over?.data.current?.unit as ITask;

    if (source && target) {
      const reorderedItems = reorderItems(tasks, source, target);
      setTasks(reorderedItems);
      sortTasks({ unitId: boardId, items: reorderedItems.map((item) => ({ id: item.id, order: item.order })) });
    }

    const activeColumnId = `${event.active?.id}`;
    const overColumnId = `${event.over?.id}`;
    const columnOrder = table.getState().columnOrder?.length
      ? table.getState().columnOrder
      : table.getAllColumns().map(column => column.id);
    const oldIndex = columnOrder.indexOf(activeColumnId);
    const newIndex = columnOrder.indexOf(overColumnId);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const newColumnOrder = [...columnOrder];
      newColumnOrder.splice(oldIndex, 1);
      newColumnOrder.splice(newIndex, 0, activeColumnId);
      setTableState((prev) => ({
        ...prev,
        columnOrder: newColumnOrder,
      }));
    }

    setActiveUnit(null);
    setActiveColumnId(null);
    // setOverUnit(null);
  };

  // const handleDragOver = (event: DragOverEvent) => {
  //   setOverUnit(event.over?.data.current?.unit);
  // };

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

  // useEffect(() => {
  //   const columns = table.getAllColumns();
  //   const currentOrder = tableState.columnOrder;
  //   const newColumn = columns.find(column => !currentOrder.includes(column.id));
  //   if (newColumn) {
  //     const newColumnOrder = [...currentOrder];
  //     newColumnOrder.splice(-1, 0, newColumn?.id);
  //     setTableState((prev) => ({
  //       ...prev,
  //       columnOrder: newColumnOrder,
  //     }));
  //   };
  // }, [table.getAllColumns()?.length]);

  return (
    <div
      ref={containerRef}
      onScroll={handleContainerScroll}
      className={cn('overflow-auto pb-2', styles.table, styles[variant])}
    >
      <div
        role='table'
        style={{ width: table.getCenterTotalSize() }}
        // className={className}
      >
        <div role='rowgroup'>
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            // onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
            onDragCancel={handleDragEnd}
            modifiers={[restrictToHorizontalAxis]}
          >
            <SortableContext
              items={table.getAllColumns().filter(col => col.id !== 'name').map(col => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <div
                  role='row'
                  key={headerGroup.id}
                  className={cn(styles['header-row'])}
                >
                  {headerGroup.headers.map((header) => {
                    const columnId = header.column.columnDef.id;
                    return (
                      <DraggableHeaderCell
                        columnId={columnId}
                        key={header.id}
                        style={{
                          width: header.getSize(),
                          maxWidth: header.column.columnDef.maxSize,
                        }}
                        sticky={columnId === STATIC_COLUMNS.NAME}
                        className="bg-background"
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </DraggableHeaderCell>
                    );
                  })}
                </div>
              ))}
            </SortableContext>
            <DragOverlay>
              {activeColumnId && (
                <DraggableHeaderOverlay
                  table={table}
                  activeColumnId={activeColumnId}
                  containerRef={containerRef}
                />
              )}
            </DragOverlay>
          </DndContext>
        </div>
        <div role='rowgroup'>
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            // onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
            onDragCancel={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={tasks}
              strategy={verticalListSortingStrategy}
            >
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  row={row}
                  className={cn(styles['body-row'], {
                    [styles['body-row-child']]: row.depth !== 0,
                    [styles['body-row_active']]: openActionsMenu === row.original,
                  })}
                  cellClassName={({ cell }) => cn(styles['body-cell'], {
                    [styles['header-cell_active']]: cell.column.columnDef.id === activeColumnActionsMenu,
                  })}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeUnit ? (
                <ListTableContextProvider>
                  <DragOverlayTable
                    style={{ maxWidth: containerRef.current?.clientWidth }}
                    tasks={[activeUnit]}
                    bodyRowClassName={cn(styles['body-row'], styles['body-row_active'])}
                    bodyCellClassName={cn(styles['header-cell_active'], styles['body-cell'])}
                  />
                </ListTableContextProvider>
              ) : null}
            </DragOverlay>
            <UnitsDndSideEffects
              activeUnit={activeUnit}
              expanded={tableState.expanded}
              onCollapse={handleCollapse}
              onExpandedReset={handleExpandedChange}
            />
          </DndContext>
        </div>
      </div>

      {/* <DnDTableContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        data={tasks}
      >
        {({ activeUnit }) => (
          <>
            <Table
              table={table}
              bodyRowClassName={({ row }) =>
                cn(styles['body-row'], {
                  [styles['body-row-child']]: row.depth !== 0,
                  [styles['body-row_active']]: openActionsMenu === row.original,
                })
              }
              headerRowClassName={styles['header-row']}
              bodyCellClassName={({ cell }) =>
                cn(
                  {
                    [styles['header-cell_active']]: cell.column.columnDef.id === activeColumnActionsMenu,
                  },
                  styles['body-cell'],
                )
              }
            />
            <DragOverlay>
              {activeUnit ? (
                <ListTableContextProvider>
                  <DragOverlayTable
                    style={{ maxWidth: containerRef.current?.clientWidth }}
                    tasks={[activeUnit]}
                    bodyRowClassName={cn(styles['body-row'], styles['body-row_active'])}
                    bodyCellClassName={cn(styles['header-cell_active'], styles['body-cell'])}
                  />
                </ListTableContextProvider>
              ) : null}
            </DragOverlay>
            <UnitsDndSideEffects
              activeUnit={activeUnit}
              expanded={tableState.expanded}
              onCollapse={handleCollapse}
              onExpandedReset={handleExpandedChange}
            />
          </>
        )}
      </DnDTableContext> */}

      <div className={cn('sticky left-0 z-[2] border-t border-[#d4d4d5]')}>
        <div
          className={cn(
            {
              'bg-white px-2 py-2.5': variant === 'table-view',
              'border-b border-text20': variant === 'table-view',
            },
            styles['add-task-row'],
          )}
        >
          <button
            onClick={handleAddTask}
            className={cn('uppercase text-xs text-fontGray flex w-full items-center gap-1 pointer', {
              'px-2 py-1.5': variant === 'list-view',
            })}
          >
            <PlusIcon />
            {variant === 'list-view' ? 'Add task' : 'New'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ListTable;
