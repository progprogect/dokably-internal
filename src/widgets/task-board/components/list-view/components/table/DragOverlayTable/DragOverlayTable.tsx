import { ITask } from '@widgets/task-board/types';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { cn } from '@app/utils/cn';
import Table from '../Table';
import { TableMeta } from '../../../types';
import { useListViewModel } from '../../../list-table.model';
import styles from './styles.module.scss';
import { CSSProperties } from 'react';

const DragOverlayTable = ({
  tasks,
  style,
  bodyCellClassName,
  bodyRowClassName,
}: {
  tasks: ITask[];
  style?: CSSProperties;
  bodyRowClassName?: string;
  bodyCellClassName?: string;
}) => {
  const { tableModel } = useListViewModel();

  const table = useReactTable({
    data: tasks,
    columns: tableModel,
    state: {},
    meta: {
      scrollState: { scrollLeft: 0 },
      draggable: { active: true },
      actionsCell: {
        open: null,
        onOpen: () => false,
      },
    } satisfies TableMeta,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table
      style={style}
      renderHeader={false}
      className={styles['draggable-table']}
      table={table}
      bodyRowClassName={cn(bodyRowClassName)}
      bodyCellClassName={bodyCellClassName}
    />
  );
};

export default DragOverlayTable;
