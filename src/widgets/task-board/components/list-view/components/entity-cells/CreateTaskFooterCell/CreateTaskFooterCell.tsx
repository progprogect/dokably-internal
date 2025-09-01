import { ReactComponent as PlusIcon } from '@icons/add-task-icon.svg';
import { PropsWithChildren } from 'react';

type TaskAddFooterCellProps = PropsWithChildren<{
  onAddTask: () => void;
}>;

function CreateTaskFooterCell(props: TaskAddFooterCellProps) {
  return (
    <button
      onMouseDown={props.onAddTask}
      className='uppercase text-xs text-fontGray flex w-full items-center gap-1 pointer px-2 py-1.5'
    >
      <PlusIcon />
      {props.children}
    </button>
  );
}

export default CreateTaskFooterCell;
