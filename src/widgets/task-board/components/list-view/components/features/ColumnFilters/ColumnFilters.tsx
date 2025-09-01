import { ChangeEvent, MouseEvent, ReactElement, useEffect, useMemo, useState } from 'react';

import ActionButton from '../../shared/ActionButton';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import SubMenu from './ui/SubMenu';
import {
  COMMON_MENU_ITEMS,
  getSubMenuItemByProperty,
  HIDE_IN_VIEW_MENU_ITEM,
  MENU_ACTION,
  Property,
  PROPERTY_TYPE_NON_SELECTED,
  SEPARATOR_MENU_ITEM,
  SORTABLE_MENU_ITEMS,
} from './model';
import Separator from './ui/Separator';
import { debounce } from 'lodash';

type TaskActionsProps = {
  open: boolean;
  trigger: ReactElement;
  activeProperty?: Property;
  searchValue?: string;
  disableSearch?: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: MENU_ACTION, property?: Property) => void;
  onSearch: (value: string, property?: Property) => void;
};

function ColumnFilters({
  open,
  trigger,
  activeProperty,
  searchValue = '',
  disableSearch,
  onOpenChange,
  onAction,
  onSearch,
}: TaskActionsProps) {
  const [internalSearchValue, setInternalSearchValue] = useState<string>(searchValue);

  const menuItems = [
    activeProperty ? getSubMenuItemByProperty(activeProperty) : PROPERTY_TYPE_NON_SELECTED,
    SEPARATOR_MENU_ITEM,
    HIDE_IN_VIEW_MENU_ITEM,
    ...SORTABLE_MENU_ITEMS,
    ...COMMON_MENU_ITEMS,
  ].filter((menuItem) => {
    switch (menuItem.id) {
      case MENU_ACTION.DELETE:
        return !activeProperty?.prohibitedActions?.includes('delete');
      case MENU_ACTION.HIDE_IN_VIEW:
        return !activeProperty?.prohibitedActions?.includes('hide-in-preview');
      default:
        return true;
    }
  });

  const handleColumnAction = (event: MouseEvent<HTMLButtonElement>) => {
    const action = event.currentTarget.name as MENU_ACTION;
    if (!action) throw new Error('ActionButton name is required option');
    onAction(action, activeProperty);
  };

  const debouncedOnSearch = useMemo(() => debounce(onSearch, 2000), [onSearch]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.value;
    setInternalSearchValue(newValue);
    debouncedOnSearch(newValue, activeProperty);
  };

  useEffect(() => {
    setInternalSearchValue(searchValue);
  }, [searchValue]);

  return (
    <Popover
      open={open}
      modal
      onOpenChange={onOpenChange}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        portal
        align='start'
        sideOffset={12}
        className='border-border p-2 flex gap-0.5 column'
      >
        <input
          value={internalSearchValue}
          placeholder={activeProperty?.name.toUpperCase()}
          type='text'
          onChange={handleInputChange}

          className='p-2 border-text10 border rounded-lg h-8'
          disabled={disableSearch}
        />

        {menuItems.map((menuItem, index) => {
          if (menuItem.type === 'separator') return <Separator key={index} />;
          if (menuItem.type === 'sub' && !activeProperty?.prohibitedActions?.includes('change-property'))
            return (
              <SubMenu
                key={index}
                menuItem={menuItem}
                onMenuItemClick={handleColumnAction}
              />
            );

          return (
            <ActionButton
              className='p-2'
              $icon={menuItem.icon}
              key={index}
              name={menuItem.id}
              onClick={handleColumnAction}
            >
              {menuItem.label}
            </ActionButton>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

export default ColumnFilters;
