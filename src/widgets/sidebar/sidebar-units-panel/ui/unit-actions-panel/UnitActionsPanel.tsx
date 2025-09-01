import { useState } from 'react';

import IconButton from '@shared/uikit/icon-button';
import { ReactComponent as Plus } from '@images/plus.svg';

import { Unit, UnitActionsPanelProps } from './props';
import ChannelUnitActionsPopup from '../channel-unit-actions-popup';
import Tooltip from '@shared/uikit/tooltip';
import { UnitActionListBtn } from '@widgets/unit-action-lists/UnitActionListBtn';
import { usePermissionsContext } from '@app/context/permissionsContext/permissionsContext';
import { cn } from '@app/utils/cn';

import styles from './styles.module.scss';

function UnitActionsPanel<U extends Unit>({
  unit,
  className,
  onCreateUnit,
}: UnitActionsPanelProps<U>) {
  const [openUnit, setOpenUnit] = useState<string | null>(null);
  const { canAddDoc: canAddDocUnit, canAddSubDoc: canAddSubDocUnit } = usePermissionsContext();
  const isChannel = unit.type === 'channel';

  const handleClose = () => setOpenUnit(null);

  const handleOpen = () => {
    const elementId = unit.id.toString();
    if (elementId === openUnit) handleClose();
    else setOpenUnit(elementId);
  };

  const handleCreateUnit = (unitType: 'document' | 'whiteboard') => {
    onCreateUnit?.({ parentId: unit.id, type: unitType });
    handleClose();
  };

  const canAddDoc = canAddDocUnit(unit.id);
  const canAddSubDoc = canAddSubDocUnit(unit.id);
  let actionsRenderer = null;

  if (isChannel) {
    if (canAddDoc) {
      actionsRenderer = (
        <ChannelUnitActionsPopup
          trigger={
            <IconButton aria-label='Create a document, whiteboard'>
              <Plus />
            </IconButton>
          }
          wrapTriggerWith={(trigger) => (
            <Tooltip
              placement='right'
              content='Create Doc, Whiteboard'
            >
              {trigger}
            </Tooltip>
          )}
          onCreateUnit={handleCreateUnit}
          onOpenChange={handleOpen}
          open={!!openUnit}
        />
      );
    }
  } else {
    actionsRenderer = (
      <>
        <UnitActionListBtn
          variant='filled'
          unit={unit}
          onOpen={handleOpen}
        />
        {canAddSubDoc && (
          <IconButton
            aria-label='Create a subdocument'
            onClick={() => handleCreateUnit('document')}
          >
            <Plus />
          </IconButton>
        )}
      </>
    );
  }

  return (
    <div
      className={cn(
        styles['unit-actions-panel'],
        openUnit === unit.id || isChannel
          ? styles['show-submenu']
          : styles['hide-submenu'],
        className,
      )}
    >
      {actionsRenderer}
    </div>
  );
}

export default UnitActionsPanel;
