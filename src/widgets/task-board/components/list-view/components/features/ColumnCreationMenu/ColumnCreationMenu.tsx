import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/uikit/dropdown-menu';

import { MouseEvent, ReactElement } from 'react';
import ActionButton from '../../shared/ActionButton';
import { columns } from './model';
import { ASSIGNEE_PROPERTY_TYPE, PropertyType, SELECT_PROPERTY_TYPE, STATUS_PROPERTY_TYPE } from '@widgets/task-board/constants';

type TaskActionsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropertyClick: (property: { name: string; type: PropertyType }) => void;
  trigger: ReactElement;
  existTypes: string[];
};

function ColumnCreationMenu({
  open,
  trigger,
  existTypes,
  onOpenChange,
  onPropertyClick,
}: TaskActionsProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const propertyType = event.currentTarget.name as PropertyType;
    const property = columns.find((p) => p.type === propertyType);

    if (!property) {
      console.log('❌ Property not found for type:', propertyType);
      return;
    }

    onPropertyClick(property);
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={onOpenChange}
      modal
    >
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        sideOffset={12}
        className='border-border'
      >
        {columns
          .filter(column => {
            if (column.type === SELECT_PROPERTY_TYPE && existTypes.includes(SELECT_PROPERTY_TYPE)) {
              return false;
            };
            if (column.type === STATUS_PROPERTY_TYPE && existTypes.includes(STATUS_PROPERTY_TYPE)) {
              return false;
            };
            if (column.type === ASSIGNEE_PROPERTY_TYPE && existTypes.includes(ASSIGNEE_PROPERTY_TYPE)) {
              return false;
            };
            return true;
          })
          .map((column) => (
            <DropdownMenuItem
              asChild
              key={column.type}
            >
              <ActionButton
                $icon={column.icon}
                name={column.type}
                onClick={handleClick}
              >
                {column.name}
              </ActionButton>
            </DropdownMenuItem>
          ))
        }
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ColumnCreationMenu;
