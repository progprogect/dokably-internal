import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import ActionButton from '../../../../shared/ActionButton';
import { ReactComponent as ArrowIcon } from '@images/arrow.svg';

import { MenuItemSub } from '../../model';
import { MouseEvent, useState } from 'react';

type SubMenuProps = {
  menuItem: MenuItemSub;
  onMenuItemClick: (event: MouseEvent<HTMLButtonElement>) => void;
};

const SubMenu = ({ menuItem, onMenuItemClick }: SubMenuProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      modal={false}
    >
      <PopoverTrigger asChild>
        <ActionButton
          name={menuItem.id}
          className='p-2'
          $icon={menuItem.icon}
          $iconEnd={
            <ArrowIcon className={!open ? 'transition-all rotate-90' : ''} />
          }
        >
          {menuItem.label}
        </ActionButton>
      </PopoverTrigger>
      <PopoverContent
        portal
        align='start'
        sideOffset={12}
        className='border-border p-1 flex gap-0.5 column'
        side='right'
      >
        {menuItem.sub.map((subItem, index) => (
          <ActionButton
            onClick={onMenuItemClick}
            key={index}
            className='px-2 py-1.5 rounded-sm'
            name={subItem.id}
            $icon={subItem.icon}
          >
            {subItem.label}
          </ActionButton>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default SubMenu;
