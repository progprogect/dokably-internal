import { cn } from "@app/utils/cn";
import { ReactComponent as SubTaskIcon } from '@icons/subtasks.svg';
import IconButton from '@shared/uikit/icon-button';
import Tooltip from '@shared/uikit/tooltip';
import { ReactComponent as PlusIcon } from '@icons/add-task-icon.svg';
import { ReactComponent as ArrowUpIcon } from '@icons/arrow-up-icon.svg';

import styles from '../AddSubTask/styles.module.scss';

interface AddKanbanSubTaskProps {
  subtasksAmount: number;
	expanded: boolean;
	toggleExpand: () => void;
	onShowSubTaskTemplate: () => void;
}

function AddKanbanSubTask({ subtasksAmount, expanded, toggleExpand: onToggleExpand, onShowSubTaskTemplate }: AddKanbanSubTaskProps) {
	return (
		<div
			onClick={e => e.stopPropagation()}
      className={cn(
        'bg-background text-text50 hover:text-text rounded p-0.5 flex items-center gap-0.5',
        styles['add-sub-task'],
        // className,
      )}
    >
      <SubTaskIcon className='w-4 h-4 transition-all' />
      {subtasksAmount !== 0 && (
        <span className='text-xs'>{subtasksAmount}</span>
      )}
      {subtasksAmount !== 0 && (
        <Tooltip content={expanded ? 'Collapse' : 'Expand'}>
          <IconButton
            onClick={onToggleExpand}
            variant='transparent'
            aria-label={expanded ? 'Collapse subtasks' : 'Expand subtasks'}
            className={cn(styles['icon-button'], {
              ['rotate-180 transition-all']: !expanded,
            })}
          >
            <ArrowUpIcon />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip content='Add sub-task'>
        <IconButton
          onClick={onShowSubTaskTemplate}
          variant='transparent'
          aria-label='Add sub-task'
          className={styles['icon-button']}
        >
          <PlusIcon />
        </IconButton>
      </Tooltip>
    </div>
	)
};

export default AddKanbanSubTask;
