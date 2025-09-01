import { FC, useMemo, useState } from 'react';
import classNames from 'classnames';

// import { Select, SelectContent, SelectItem, SelectTrigger } from '@shared/uikit/select';
import { ASSIGNEE_PROPERTY_TYPE, TASK_ASSIGNEE_PROPERTY } from '@widgets/task-board/constants';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { ITask } from '@widgets/task-board/types';
import { useWorkspaceContext } from '@app/context/workspace/context';
import { cn } from '@app/utils/cn';
import { Avatar, AvatarFallback } from '@shared/uikit/avatar';
import { getInitials } from '@app/utils/get-initials';

import { ReactComponent as AddAssignee } from '@icons/add-assignee.svg';
// import { ReactComponent as CrossIcon } from '@icons/close.svg';

import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import { SelectMenu } from "@widgets/editor/plugins/blocks/Table/cells/SelectCell/SelectMenu";
import { Option } from '@widgets/editor/plugins/blocks/Table/Table.types';
import style from "@widgets/task-board/components/list-view/components/entity-cells/MultiselectBodyCell/styles.module.scss";
import styles from "./styles.module.scss";

export interface TaskAssignPropertyProps {
  task: ITask;
  size?: 'sm' | 'lg';
  disabled?: boolean;
  refetch?: () => void;
  className?: string;
  iconClassName?: string;
}

export const TaskAssignProperty: FC<TaskAssignPropertyProps> = ({
  task,
  size = 'sm',
  disabled,
  refetch,
  className,
  iconClassName,
}) => {
  const { activeMembers: members, activeGuests: guests } = useWorkspaceContext();

  const { updateTaskAssignee } = useTaskBoard();

  // const assigneeUser = useMemo(() => {
  //   const users = [...members, ...guests];

  //   const taskAssigneeUser = task.properties.find(
  //     (x) => x.type === ASSIGNEE_PROPERTY_TYPE && x.name === TASK_ASSIGNEE_PROPERTY,
  //   );
  //   const user = users.find((x) => x.user.id === taskAssigneeUser?.value[0]);
  //   if (user) {
  //     return user;
  //   }
  //   return undefined;
  // }, [task.properties, members, guests]);

  // const handleChangeAssignee = async (userId: string) => {
  //   await updateTaskAssignee(task.id, [userId]);
  //   refetch?.();
  //   setTimeout(() => {
  //     const activeElement = document.activeElement;
  //     if (activeElement instanceof HTMLElement) {
  //       activeElement.blur();
  //     }
  //   }, 0);
  // };
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handlePopoverOpenChange = () => setIsPopoverOpen(!isPopoverOpen);

  const users = [...members, ...guests];
  const taskAssigneeUser = task.properties.find(
    (x) => x.type === ASSIGNEE_PROPERTY_TYPE && x.name === TASK_ASSIGNEE_PROPERTY,
  );
  const options = users.map(item => ({
    id: item.user?.id,
    label: item.user?.name || item.user?.email,
    email: item.user?.email,
    color: "",
  }));
  const activeOptions = options.filter((option) => taskAssigneeUser?.value?.includes(option.id));

  const handleChangeAssignee = async (values: Option[]) => {
    await updateTaskAssignee(task.id, values.map(value => value.id));
    refetch?.();
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    }, 0);
  };


  return (
    // <Select
    //   value={assigneeUser ? assigneeUser.user.id : ''}
    //   onValueChange={handleChangeAssignee}
    //   disabled={disabled}
    //   onOpenChange={(isOpen) => {
    //     if (!isOpen) {
    //       setTimeout(() => {
    //         const activeElement = document.activeElement;
    //         if (activeElement instanceof HTMLElement) {
    //           activeElement.blur();
    //         }
    //       }, 0);
    //     }
    //   }}
    // >
    //   {assigneeUser ? (
    //     <div className={classNames('flex gap-0.5 items-center rounded-md group/assignee w-fit relative', className)}>
    //       <SelectTrigger className='w-fit h-fit border-none outline-none bg-transparent p-0 [&>svg]:hidden'>
    //         <div
    //           className={cn('w-fit h-6 flex items-center justify-center gap-2 p-1 text-[#29282c]', {
    //             'py-1.5': size != 'sm',
    //           })}
    //         >
    //           <Avatar>
    //             <AvatarFallback className='text-[8px] rounded-md bg-[#6598FF] text-white'>
    //               {getInitials(assigneeUser.user.name ?? assigneeUser.user.email ?? '')}
    //             </AvatarFallback>
    //           </Avatar>
    //           {size != 'sm' && assigneeUser.user.name}
    //         </div>
    //       </SelectTrigger>
    //       <div
    //         className={`w-4 h-4 rounded-md cursor-pointer text-text40 flex items-center justify-center ${iconClassName}`}
    //         onClick={(e) => {
    //           e.preventDefault();
    //           e.stopPropagation();
    //           updateTaskAssignee(task.id, []);
    //         }}
    //       >
    //         <CrossIcon className='w-3 h-3' />
    //       </div>
    //     </div>
    //   ) : (
    //     <SelectTrigger className='w-fit h-fit border-none outline-none bg-transparent p-0 [&>svg]:hidden'>
    //       <div className='h-6 rounded-md cursor-pointer flex items-center justify-center'>
    //         <AddAssignee />
    //         {size != 'sm' && 'Assign'}
    //       </div>
    //     </SelectTrigger>
    //   )}
    //   <SelectContent className='outline-none border-none'>
    //     {[...members, ...guests].map((item) => {
    //       return (
    //         <SelectItem
    //           key={`priority-${item.user.id}`}
    //           value={item.user.id.toString()}
    //           className={cn('rounded-sm cursor-pointer hover:bg-backgroundHover')}
    //         >
    //           <div className='flex flex-row gap-2 items-center'>
    //             <div className='flex items-center gap-1'>
    //               <Avatar>
    //                 <AvatarFallback className='text-[8px] rounded-md bg-[#6598FF] text-white'>
    //                   {getInitials(item.user.name ?? item.user.email ?? '')}
    //                 </AvatarFallback>
    //               </Avatar>
    //               {item.user.name ?? item.user.email}
    //             </div>
    //           </div>
    //         </SelectItem>
    //       );
    //     })}
    //   </SelectContent>
    // </Select>
    <Popover
      open={isPopoverOpen}
      onOpenChange={(open) => setIsPopoverOpen(open)}
    >
      <PopoverTrigger
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          handlePopoverOpenChange();
        }}
        className={className}
        style={{
          borderColor: isPopoverOpen ? "#4a86ff" : "",
          height: 26,
        }}
      >
        <div
          className={classNames(style.multiselectCell, styles.assigneeValues)}
          style={{ width: "100%", height: "100%", position: 'relative' }}
        >
          {activeOptions.length ? activeOptions.slice(0, 2).map((value, index) => (
            <div
              className={cn('w-fit h-6 flex items-center justify-center gap-2 text-[#29282c]', {
                'pr-2': size != 'sm',
              })}
              style={size === 'sm' ? { left: -(index * 8) } : {}}
            >
              <Avatar>
                <AvatarFallback className='text-[8px] rounded-md bg-[#6598FF] text-white'>
                  {getInitials(value.label ?? value.email ?? '')}
                </AvatarFallback>
              </Avatar>
              {size !== 'sm' && value.label}
            </div>
          )) : (
            <div className='h-6 rounded-md cursor-pointer flex items-center justify-center'>
              <AddAssignee />
              {size != 'sm' && 'Assign'}
            </div>
          )}
          {activeOptions.length > 2 ? (
            <div
              className={cn('w-fit h-5 w-5 flex items-center justify-center mt-[2px] gap-2 text-[10px] text-[#7F7E80] bg-[#F7F7F8] rounded-md')}
              style={size === 'sm' ? { left: -16 } : {}}
            >
              +{activeOptions.length - 2}
            </div>
          ) : null}
        </div>
      </PopoverTrigger>

      <PopoverContent
        className={styles.assigneePopover}
        autoFocusContent={false}
        side='bottom'
        align='start'
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          handlePopoverOpenChange();
        }}
      >
        <SelectMenu
          value={activeOptions}
          updateValue={handleChangeAssignee}
          options={options}
          updateOptions={undefined as any}
          hideSearch
          hideMoreButton
          showAvatar
        />
      </PopoverContent>
    </Popover>
  );
};
