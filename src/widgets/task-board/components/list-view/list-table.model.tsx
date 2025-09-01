import { ColumnDef, ColumnDefTemplate } from '@tanstack/react-table';
import { IProperty, ITask } from '@widgets/task-board/types';
import TaskNameBodyCell from './components/entity-cells/TaskNameBodyCell';
import { cn } from '@app/utils/cn';
import styles from './styles.module.scss';
import { CellContext, ColumnNameMeta, DefaultColumnMeta } from './types';
import TaskPriorityBodyCell from './components/entity-cells/TaskPriorityBodyCell';
import AssignTaskBodyCell from './components/entity-cells/AssignTaskBodyCell';
import TaskStatusBodyCell from './components/entity-cells/TaskStatusBodyCell';
import DueDateBodyCell from './components/entity-cells/DueDateBodyCell';
import { useMemo } from 'react';
import {
  ASSIGNEE_PROPERTY_TYPE,
  CHECKBOX_PROPERTY_TYPE,
  DATE_PROPERTY_TYPE,
  DOC_LINKS_PROPERTY_TYPE,
  EMAIL_PROPERTY_TYPE,
  FILE_PROPERTY_TYPE,
  MULTISELECT_PROPERTY_TYPE,
  NUMBER_PROPERTY_TYPE,
  SELECT_PROPERTY_TYPE,
  STATUS_PROPERTY_TYPE,
  TEXT_PROPERTY_TYPE,
  URL_PROPERTY_TYPE,
} from '@widgets/task-board/constants';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import HederCellContent from './components/base-cells/HederCellContent';
import TaskActionsHeaderCell from './components/entity-cells/TaskActionsHeaderCell';
import WithInteractiveHeaderCell from './cell-decorators/WithInteractiveHeaderCell';
import PropertyHeaderCell from './components/entity-cells/PropertyHeaderCell';
import { WorkspaceMember } from '@entities/models/workspaceMember';
import NumberBodyCell from './components/entity-cells/NumberBodyCell';
import EmailBodyCell from './components/entity-cells/EmailBodyCell';
import TextBodyCell from './components/entity-cells/TextBodyCell';
import CheckboxBodyCell from './components/entity-cells/CheckboxBodyCell';
// import CheckboxHeaderCell from './components/entity-cells/CheckboxHeaderCell';
import MultiselectBodyCell from './components/entity-cells/MultiselectBodyCell';
import UrlBodyCell from './components/entity-cells/UrlBodyCell';
import WithActionButtonBodyCell from './cell-decorators/WithActionButtonBodyCell';
import DocLinksBodyCell from './components/entity-cells/DocLinksBodyCell';
import FilesBodyCell from './components/entity-cells/FilesBodyCell';
import WithResizeHandlerHeaderCell from './cell-decorators/WIthResizeHandlerHeaderCell';
import { PropertyOption } from './utils/findPropertyOption';
import { assigneeSortingFn, textPropertiesSortingFn } from './utils/sortingFn';
import { findProperty } from './utils/findProperty';
import { useWorkspaceContext } from '@app/context/workspace/context';

export enum STATIC_COLUMNS {
  NAME = 'name',
  ACTIONS = 'actions',
}

function withDefaultMeta<D, V>(columnDef: ColumnDef<D, V>): ColumnDef<D, V> {
  return {
    ...columnDef,
    meta: {
      ...columnDef.meta,
      className: cn((columnDef.meta as DefaultColumnMeta)?.className),
    },
  };
}

function mapTaskPropertiesToTableColumns(
  properties: Array<{
    id: string;
    name: string;
    type: string;
    options?: Array<PropertyOption>;
  }>,
  users: WorkspaceMember[],
): ColumnDef<ITask, any>[] {
  return properties.map((property) => {
    const header = WithResizeHandlerHeaderCell(
      WithInteractiveHeaderCell(PropertyHeaderCell, {
        className: styles['column-action-button'],
      }),
    );
    switch (property.type) {
      case SELECT_PROPERTY_TYPE:
        return withDefaultMeta({
          accessorFn: (row) => row,
          sortingFn: (rowA, rowB) => {
            return textPropertiesSortingFn(rowA.original, rowB.original, property.id, property.options);
          },
          id: property.id,
          cell: TaskPriorityBodyCell,
          size: 76,
          header,
          enableHiding: true,
          enableSorting: true,
          sortUndefined: -1,
          enableResizing: true,
        });
      case ASSIGNEE_PROPERTY_TYPE:
        return withDefaultMeta({
          accessorFn: (row) => row,
          sortingFn: (rowA, rowB) => assigneeSortingFn(rowA.original, rowB.original, property.id, users),
          id: property.id,
          cell: AssignTaskBodyCell,
          size: 76,
          header,
          enableHiding: true,
          enableSorting: true,
          sortUndefined: -1,
          enableResizing: true,
        });
      case STATUS_PROPERTY_TYPE:
        return withDefaultMeta({
          accessorFn: (row) => row,
          sortingFn: (rowA, rowB) => {
            return textPropertiesSortingFn(rowA.original, rowB.original, property.id, property.options);
          },
          id: property.id,
          size: 76,
          cell: TaskStatusBodyCell,
          header,
          enableHiding: true,
          enableSorting: true,
          sortUndefined: -1,
          enableResizing: true,
        });
      case DATE_PROPERTY_TYPE:
        return withDefaultMeta({
          accessorFn: (row) => findProperty(property.id, row.properties)?.value,
          id: property.id,
          sortingFn: 'datetime',
          cell: DueDateBodyCell,
          size: 76,
          header,
          enableHiding: true,
          enableSorting: true,
          sortUndefined: -1,
          enableResizing: true,
        });
      case TEXT_PROPERTY_TYPE:
        return withDefaultMeta({
          accessorFn: (row) => findProperty(property.id, row.properties)?.value,
          sortingFn: 'text',
          id: property.id,
          cell: TextBodyCell,
          size: 150,
          header,
          enableHiding: true,
          sortUndefined: -1,
          enableResizing: true,
        });
      case NUMBER_PROPERTY_TYPE:
        return withDefaultMeta({
          accessorFn: (row) => findProperty(property.id, row.properties)?.value,
          sortingFn: 'alphanumeric',
          id: property.id,
          cell: NumberBodyCell,
          size: 76,
          header,
          enableHiding: true,
          sortUndefined: -1,
          enableResizing: true,
        });
      case EMAIL_PROPERTY_TYPE:
        return withDefaultMeta({
          accessorFn: (row) => findProperty(property.id, row.properties)?.value,
          sortingFn: 'text',
          id: property.id,
          cell: EmailBodyCell,
          size: 150,
          header,
          enableHiding: true,
          sortUndefined: -1,
          enableResizing: true,
        });
      case CHECKBOX_PROPERTY_TYPE:
        return withDefaultMeta({
          accessorFn: (row) => findProperty(property.id, row.properties)?.value,
          sortingFn: 'auto',
          id: property.id,
          cell: CheckboxBodyCell,
          size: 76,
          header,
          enableHiding: true,
          sortUndefined: -1,
          enableResizing: true,
        });
      case MULTISELECT_PROPERTY_TYPE:
        return withDefaultMeta({
          accessorFn: (row) => row,
          sortingFn: (rowA, rowB) =>
            textPropertiesSortingFn(rowA.original, rowB.original, property.id, property.options),
          id: property.id,
          cell: MultiselectBodyCell,
          size: 100,
          header,
          enableHiding: true,
          enableResizing: true,
        });
      case URL_PROPERTY_TYPE:
        return withDefaultMeta({
          accessorFn: (row) => findProperty(property.id, row.properties)?.value,
          sortingFn: 'text',
          id: property.id,
          cell: UrlBodyCell,
          size: 150,
          header,
          enableHiding: true,
          enableResizing: true,
        });
      case DOC_LINKS_PROPERTY_TYPE:
        return withDefaultMeta({
          accessorFn: (row) => row.properties.find((p) => p.id === property.id),
          id: property.id,
          cell: DocLinksBodyCell,
          size: 150,
          header,
          enableHiding: true,
          enableSorting: false,
          enableResizing: true,
        });
      case FILE_PROPERTY_TYPE:
        return withDefaultMeta({
          accessorFn: (row) => row.properties.find((p) => p.id === property.id),
          id: property.id,
          cell: FilesBodyCell,
          size: 150,
          header,
          enableHiding: true,
          enableSorting: false,
          enableResizing: true,
        });
      default:
        return {
          accessorFn: (row) => row.properties.find((p) => p.id === property.id)?.value,
          id: property.id,
          cell: (context: CellContext<ITask, IProperty | undefined>) => context.getValue()?.value,
          header: '',
          enableHiding: true,
          enableSorting: true,
          sortUndefined: -1,
        };
    }
  });
}

export const useListViewModel = () => {
  const { properties } = useTaskBoard();
  const { members } = useWorkspaceContext();

  const tableModel: ColumnDef<ITask, any>[] = useMemo(() => {
    const columns = [
      withDefaultMeta({
        id: STATIC_COLUMNS.NAME,
        accessorFn: (row) => row.name,
        cell: WithActionButtonBodyCell(TaskNameBodyCell, {
          className: styles['row-action-button'],
          classNameIcon: cn(styles['cell-content-hide-element'], styles['cell-content-show-element']),
        }),
        sortingFn: 'alphanumeric',
        footer: 'ADD TASK',
        header: WithResizeHandlerHeaderCell(
          WithInteractiveHeaderCell(
            () => (
              <HederCellContent
                $contentAlign='start'
                $uppercase
              >
                Name
              </HederCellContent>
            ),
            { className: styles['column-action-button'] },
          ),
        ),
        size: 351,
        minSize: 150,
        enableHiding: false,
        enableSorting: true,
        sortUndefined: -1,
        enableResizing: true,
        meta: {
          getAddSubtaskClassname: (_task: ITask, options) =>
            cn(
              {
                [styles['cell-content-hide-element']]: options.subRows.length === 0,
              },
              styles['cell-content-show-element'],
              'transition-all',
            ),
        } satisfies ColumnNameMeta,
      }),
      ...mapTaskPropertiesToTableColumns(properties, members),
      withDefaultMeta({
        id: STATIC_COLUMNS.ACTIONS,
        cell: (() => <></>) as ColumnDefTemplate<CellContext<ITask, unknown>>,
        accessorFn: (row) => row,
        size: 48,
        maxSize: 48,
        header: TaskActionsHeaderCell,
        enableHiding: false,
        enableSorting: false,
        enableMultiSort: false,
      }),
    ];

    return columns;
  }, [members, properties]);

  return { tableModel };
};

const virtualTaskType: unique symbol = Symbol('VirtualTaskType');
const virtualTaskParent: unique symbol = Symbol('VirtualTaskParent');

type VirtualTaskType = 'task' | 'subTask';
type VirtualTaskParent = string | null;

export type VirtualTask = ITask & {
  [virtualTaskType]?: VirtualTaskType;
  [virtualTaskParent]?: VirtualTaskParent;
};

const VIRTUAL_TASK: VirtualTask = {
  id: '',
  name: '',
  order: -1,
  description: '',
  properties: [
    {
      value: null,
      id: '',
      type: 'select',
      name: 'Priority',
    },
    {
      value: null,
      id: '',
      type: 'status',
      name: 'Status',
    },
  ],
  subtasksAmount: 0,
};

export const createVirtualTask = (type: VirtualTaskType, parent: string | null): VirtualTask => {
  return {
    ...VIRTUAL_TASK,
    [virtualTaskType]: type,
    [virtualTaskParent]: parent,
  };
};

export const getVirtualTaskType = (obj: VirtualTask): VirtualTaskType | undefined => {
  return obj[virtualTaskType];
};

export const getVirtualTaskParent = (obj: VirtualTask): VirtualTaskParent | undefined => {
  return obj[virtualTaskParent];
};

export const isVirtualTask = (obj: VirtualTask): obj is VirtualTask => {
  return !!obj[virtualTaskType];
};
