import { useEffect } from 'react';
import { isNull } from 'lodash';
import { MoreHorizontal } from 'lucide-react';

import { ITask } from '@widgets/task-board/types';
import DeleteIcon from '@widgets/editor/plugins/blocks/Table/img/Delete';
import { DATE_PROPERTY_TYPE } from '@widgets/task-board/constants';
// import DuplicateIcon from '@widgets/editor/plugins/blocks/Table/img/Duplicate';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { ReactComponent as SubTaskIcon } from '@icons/subtasks.svg';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from '@shared/uikit/dropdown-menu';

import { TaskPriorityProperty } from '../properties/priority/task-priority-property';
import { TaskAssignProperty } from '../properties/assignee/task-assign-property';
import { TaskDateProperty } from '../properties/date/task-date-property';
import CreateTaskForm from '../list-view/components/shared/CreateTaskForm';

interface ISubtaskProps {
  isNewSubTask?: boolean;
  subtask?: ITask;
  handleSubTaskCreate?: (data: { name: string }) => void;
  onHideSubTaskTemplate?: () => void;
	handleSubTaskDelete?: (taskId: string) => void;
	refetchSubTasks?: () => void;
	openTaskPanel?: (taskId: string, isSubtask?: boolean) => void;
}

const SubTask = ({ subtask, handleSubTaskCreate, onHideSubTaskTemplate, handleSubTaskDelete, refetchSubTasks, openTaskPanel }: ISubtaskProps) => {
	const { ref, isVisible, setIsVisible } = useClickOutside(
    false,
    () => undefined,
    'mouseup',
  );

	const handleCreate = (data: { name: string }) => {
		if (handleSubTaskCreate) handleSubTaskCreate(data);
		setIsVisible(false);
	}
	const handleDelete = () => {
		if (subtask && handleSubTaskDelete) {
			handleSubTaskDelete(subtask?.id);
		};
	};
	const handleSubtaskClick = (e: any) => {
		e.stopPropagation();
		if (subtask && openTaskPanel) openTaskPanel(subtask?.id, true);
	};

	useEffect(() => {
		if (!subtask) setIsVisible(true);
	}, [subtask])

	useEffect(() => {
		if (isNull(isVisible) && onHideSubTaskTemplate) onHideSubTaskTemplate();
	}, [isVisible])

  const dateProperty = subtask?.properties.find(p => p.type === DATE_PROPERTY_TYPE);
	
  return (
    <div
			ref={ref}
      key={subtask?.id || ""}
      onClick={handleSubtaskClick}
      className='min-h-[100px] flex flex-col justify-between w-full sub-task mt-[12px] pt-[12px] border-t-0.5 border-[#EAEAEA]'
    >
      <div className='text-sm break-word text-text50 flex items-center'>
        {handleSubTaskCreate && onHideSubTaskTemplate ? (
          <CreateTaskForm
						isKanban
            onCreate={handleCreate}
            onCancel={onHideSubTaskTemplate}
            variant='sub-task'
          />
        ) : (
          <div className='flex items-start justify-between w-full'>
						<div className='flex'>
							<SubTaskIcon className='min-w-[16px] min-h-[16px] transition-all' />
							<span className='text-text pl-[2px] break-words'>{subtask?.name}</span>
						</div>
						<div>
							<DropdownMenu modal={false}>
								<DropdownMenuTrigger onClick={e => e.stopPropagation()}>
									<MoreHorizontal className='h-6 w-6 p-1 rounded-sm cursor-pointer hover:bg-text10' />
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className='border-border'
									contentEditable={false}
									onClick={e => e.stopPropagation()}
								>
									{/* <DropdownMenuItem
										className='hover:bg-text10/60 px-2 py-1.5 rounded-md cursor-pointer text-text70 flex items-center gap-2'
										// onClick={handleDuplicate}
									>
										<DuplicateIcon /> Duplicate
									</DropdownMenuItem> */}
									<DropdownMenuItem
										className='hover:bg-text10/60 px-2 py-1.5 rounded-md cursor-pointer text-text70 flex items-center gap-2'
										onClick={handleDelete}
									>
										<DeleteIcon /> Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
          </div>
        )}
      </div>
			{subtask && (
				<>
					<div className='flex'>{dateProperty?.value && <TaskDateProperty task={subtask} property={dateProperty} />}</div>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-1 flex-1'>
							<TaskPriorityProperty task={subtask} refetch={refetchSubTasks} />
							<TaskAssignProperty
								task={subtask}
              	iconClassName='opacity-0 group-hover/assignee:opacity-100 absolute top-[-4px] right-[-4px] bg-[#eaeaea]'
								refetch={refetchSubTasks}
							/>
							{dateProperty && !dateProperty?.value && <TaskDateProperty task={subtask} property={dateProperty} className='text-[#a9a9ab]' refetch={refetchSubTasks} />}
						</div>
					</div>
				</>
			)}
    </div>
  )
}

export default SubTask;