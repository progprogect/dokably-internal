import { Active, DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { CellContext as TanstackCellContext, Row } from '@tanstack/react-table';
import { ITask } from '@widgets/task-board/types';

export type DefaultColumnMeta = {
  className?: string;
};

export type ScrollState = { scrollLeft: number };

export type TableMeta = {
  scrollState: ScrollState;
  draggable?: {
    active?: boolean;
  };
  actionsCell: {
    open: ITask | null;
    onOpen: (row: ITask | null) => void;
  };
};

export type ActionsColumnMeta = DefaultColumnMeta & {
  hideContentClassName?: string;
};

export type ColumnNameMeta = DefaultColumnMeta & {
  getAddSubtaskClassname: (
    task: ITask,
    options: { expanded: boolean; subRows: Row<ITask>[] },
  ) => string;
};

export type CellContext<D, V> = TanstackCellContext<D, V> & {
  $rowContext?: {
    draggable?: {
      attributes: DraggableAttributes;
      listeners: SyntheticListenerMap | undefined;
      setActivatorNodeRef: (element: HTMLElement | null) => void;
    };
  };
};
