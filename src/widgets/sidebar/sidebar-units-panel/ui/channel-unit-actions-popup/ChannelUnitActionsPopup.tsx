import { MouseEvent } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import ActiveButton from '@shared/uikit/active-button';

import { ReactComponent as WhiteboardIcon } from '@images/whiteboard.svg';
import { ReactComponent as Document } from '@images/document.svg';

import { ChannelUnitActionsPopupProps, ChannelUnitType } from './props';

function ChannelUnitActionsPopup({
  open,
  trigger,
  wrapTriggerWith,
  onOpenChange,
  onCreateUnit,
}: ChannelUnitActionsPopupProps) {
  const popoverTrigger = <PopoverTrigger asChild>{trigger}</PopoverTrigger>;

  const handleCreateUnit = (event: MouseEvent<HTMLButtonElement>) => {
    const unitType = event.currentTarget.dataset.unitType;
    if (!unitType) return;
    onCreateUnit(unitType as ChannelUnitType);
  };

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
    >
      {wrapTriggerWith ? wrapTriggerWith(popoverTrigger) : popoverTrigger}
      <PopoverContent
        autoFocusContent
        alignOffset={-6}
        sideOffset={14}
        className='min-w-[240px]'
        align='end'
        side='bottom'
      >
        <div className='p-2'>
          <ActiveButton
            data-unit-type='document'
            leftSection={<Document />}
            onClick={handleCreateUnit}
          >
            New doc
          </ActiveButton>
          <ActiveButton
            data-unit-type='whiteboard'
            leftSection={<WhiteboardIcon />}
            onClick={handleCreateUnit}
          >
            New whiteboard
          </ActiveButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ChannelUnitActionsPopup;
