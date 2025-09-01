import { ComponentProps, Dispatch, ReactNode, SetStateAction } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import IconButton from '../icon-button';

export interface IMoreButton {
  popupPosition?: Position;
  children: ReactNode;
  popupAlign?: Align;
  size?: ComponentProps<typeof IconButton>['size'];
  variant?: 'transparent' | 'filled';
  onOpenCallback?: (open: boolean) => void;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export type Position = 'left' | 'bottom' | 'right' | 'top';
export type Align = 'center' | 'end' | 'start';

const MoreButton = ({
  popupPosition = 'bottom',
  children,
  popupAlign = 'start',
  size = 'xs',
  variant = 'transparent',
  onOpenCallback,
  isOpen,
  setIsOpen,
}: IMoreButton) => {
  const handleOpenPopUp = (_open: boolean) => {
    setIsOpen(_open);
    onOpenCallback?.(_open);
  };

  return (
    <>
      <Popover
        open={isOpen}
        onOpenChange={handleOpenPopUp}
      >
        <PopoverTrigger asChild>
          <IconButton
            variant={isOpen ? 'active' : variant}
            size={size}
            aria-label='Show document/whiteboard actions'
          >
            <MoreHorizontal />
          </IconButton>
        </PopoverTrigger>
        <PopoverContent
          autoFocusContent
          className='min-w-[180px]'
          align={popupAlign}
          side={popupPosition}
        >
          <div className='p-[5px]'>{children}</div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default MoreButton;
