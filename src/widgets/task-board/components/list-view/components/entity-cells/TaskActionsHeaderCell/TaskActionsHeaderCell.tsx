import HederCellContent from '../../base-cells/HederCellContent';
import { ReactComponent as PlusIcon } from '@images/plus.svg';
import IconButton from '@shared/uikit/icon-button';
import { useState } from 'react';
import ColumnCreationMenu from '../../features/ColumnCreationMenu';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { useCreateProperty } from '@app/queries/property/useCreateProperty';

function TaskActionsHeaderCell() {
  const [open, setOpen] = useState<boolean>(false);
  const { id, properties } = useTaskBoard();
  const { createProperty } = useCreateProperty();



  return (
    <HederCellContent $contentAlign='center'>
      <ColumnCreationMenu
        open={open}
        onOpenChange={(newOpen) => {
      
          setOpen(newOpen);
        }}
        existTypes={properties.map(p => p.type)}
        onPropertyClick={async ({ type, name }) => {
      
          await createProperty(type, { unitId: id, name });
        }}
        trigger={
          <IconButton
            active={open}
            variant='transparent'
            aria-label='Show/hide columns popup'
          >
            <PlusIcon />
          </IconButton>
        }
      />
    </HederCellContent>
  );
}

export default TaskActionsHeaderCell;
