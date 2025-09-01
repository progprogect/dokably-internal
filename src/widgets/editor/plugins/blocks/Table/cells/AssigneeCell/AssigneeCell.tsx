import { useMemo, useState } from 'react';
import cn from 'classnames';
import { ActionTypes } from '../../utils';
import { AssigneePopoverContent } from './AssigneePopoverContent';
import cssStyles from './style.module.scss';
import { SuggestionDataItem } from 'react-mentions';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';
import { useWorkspaceContext } from '@app/context/workspace/context';

export type Value = SuggestionDataItem[] | null;

interface Props {
  value: Value;
  columnId: string;
  rowIndex: number;
}

export const AssigneeCell = ({ value, columnId, rowIndex }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { dataDispatch } = useTableContext();
  const { activeMembers, activeGuests } = useWorkspaceContext();

  const options = useMemo(
    () =>
      [...activeMembers, ...activeGuests].map((item) => {
        return {
          id: item.user.id,
          display: item.user.name || item.user.email,
        };
      }),
    [activeMembers, activeGuests],
  );

  function updateValue(value: Value) {
    dataDispatch({
      type: ActionTypes.UPDATE_CELL,
      columnId,
      rowIndex,
      value,
    });
    setIsPopoverOpen(false);
  }

  const handlePopoverOpenChange = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const getInitials = (fullName: string): string => {
    const names = fullName.split(' ');
    const initials = names.map((name) => name.charAt(0).toUpperCase()).join('');
    return initials;
  };

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={handlePopoverOpenChange}
    >
      <PopoverTrigger>
        <div
          className={cn(cssStyles.root, {
            [cssStyles.active]: isPopoverOpen,
          })}
        >
          {value?.map((user) => (
            <div
              key={user.id}
              className={cn(cssStyles.option)}
            >
              <span className={cssStyles.avatar}>{getInitials(user.display || '')}</span>
              <span className={cssStyles.name}>{user.display || ''}</span>
            </div>
          ))}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cssStyles.popover}
        portal
        side='bottom'
        align='start'
        autoFocusContent={false}
      >
        <AssigneePopoverContent
          options={options}
          users={value}
          updateValue={updateValue}
        />
      </PopoverContent>
    </Popover>
  );
};
