import { CellContext } from '@tanstack/react-table';
import { ITask } from '@widgets/task-board/types';
import { ReactComponent as SubTaskIcon } from '@icons/subtasks.svg';

import { ColumnNameMeta } from '../../../types';
import { getColumnMeta } from '../../../utils/getColumnMeta';
import BodyCellContent from '../../base-cells/BodyCellContent';
import AddSubTask from '../../shared/AddSubTask';
import UpdateTask from '../../features/UpdateTaskName';
import {
  createVirtualTask,
  getVirtualTaskParent,
  getVirtualTaskType,
} from '../../../list-table.model';
import CreateTask from '../../features/CreateTask';
import { useListTableContext } from '../../../context/ListTableContext';
import CreateSubTask from '../../features/CreateSubTask';
import { useEffect } from 'react';
import { cn } from '@app/utils/cn';
import { getTableMeta } from '../../../utils/getTableMeta';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { Link } from 'react-router-dom';

function TaskNameBodyCell(props: CellContext<ITask, string>) {
  const initialValue = props.getValue();
  const columnMeta = getColumnMeta<ITask, ColumnNameMeta>(props.column);
  const tableMeta = getTableMeta(props.table);
  const virtualTask = getVirtualTaskType(props.cell.row.original);
  const { removeVirtualTask, addVirtualTask, editableTask } =
    useListTableContext();
  const original = props.row.original;
  const parent = getVirtualTaskParent(original);
  const { id } = useTaskBoard();
  const toggleExpand = props.row.getToggleExpandedHandler();
  const expanded = props.row.getIsExpanded();
  const depth = props.row.depth;

  const editableCell =
    editableTask?.task === original && editableTask.value === 'name';

  useEffect(() => {
    if (!original.subtasks?.length) {
      props.row.toggleExpanded(false);
    }
  }, [original.subtasks?.length, props.row]);

  return (
    <BodyCellContent
      className={cn(
        'gap-2',
        'border-r-2 text-text text-sm border-solid border-transparent',
        {
          'border-text20': tableMeta.scrollState.scrollLeft > 0,
        },
        columnMeta.className,
      )}
      $contentAlign='start'
    >
      {virtualTask === 'task' && (
        <CreateTask
          onCancel={() => removeVirtualTask(original)}
          onCreate={() => removeVirtualTask(original)}
        />
      )}

      {virtualTask === 'subTask' && parent && (
        <CreateSubTask
          parent={parent}
          onCancel={() => removeVirtualTask(original)}
          onCreate={() => removeVirtualTask(original)}
        />
      )}

      {!virtualTask && !editableCell && (
        <Link
          to={{
            search: new URLSearchParams({
              task: original.id,
              board: id,
            }).toString(),
          }}
          className='flex items-center gap-1 h-full w-full flex-grow'
        >
          {depth > 0 && <SubTaskIcon className='shrink-0 text-text60' />}
          {original.name}
        </Link>
      )}

      {!virtualTask && editableCell && (
        <UpdateTask
          variant={depth === 0 ? 'task' : 'sub-task'}
          defaultValue={initialValue}
          task={props.cell.row.original}
          autoFocus
        />
      )}

      {!virtualTask && depth === 0 && (
        <AddSubTask
          onToggleExpand={toggleExpand}
          subtasksAmount={original.subtasksAmount}
          expanded={expanded}
          className={columnMeta.getAddSubtaskClassname(original, {
            subRows: props.row.subRows,
            expanded,
          })}
          onAddSubTask={() => {
            props.row.toggleExpanded(true);
            addVirtualTask(createVirtualTask('subTask', original.id));
          }}
        />
      )}
    </BodyCellContent>
  );
}

export default TaskNameBodyCell;
