import { useSortable } from '@dnd-kit/sortable';
import { CSSProperties, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import DotsIcon from '../img/Dots';
import cn from 'classnames';
import ReactDOM from 'react-dom';
import cssStyles from './style.module.scss';

import { TableRow } from '@widgets/editor/plugins/blocks/Table/Table.types';
import { Row } from '@tanstack/react-table';
import usePopper from '@app/hooks/usePopper';
import { RowMenu } from './RowMenu';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

export const DraggableRowHeader = ({
  row,
  permanent,
  rowHoverId,
  hoverTable,
}: {
  row: Row<TableRow>;
  permanent?: boolean;
  rowHoverId?: string;
  hoverTable?: boolean;
}) => {
  const [rowMenuIsOpen, setRowMenuIsOpen] = useState(false);
  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({
    id: row.original.id,
  });

  const rowIsHovered = rowHoverId === row.id || permanent;

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: rowMenuIsOpen ? '#4A86FF' : rowIsHovered ? '#d4d4d4' : hoverTable ? '#eaeaea' : '',
  };
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const { portalId } = useTableContext();

  const popover = usePopper({
    portalId,
    referenceElement: referenceElement,
    externalStyles: {
      zIndex: 4,
      minWidth: 200,
      maxWidth: 520,
      maxHeight: 400,
      padding: '8px',
    },
    placement: 'bottom-start',
    children: (
      <RowMenu
        rowId={row.id}
        setShowHeaderMenu={setRowMenuIsOpen}
      />
    ),
  });

  return (
    <>
      {rowMenuIsOpen &&
        ReactDOM.createPortal(
          <div
            className={cssStyles.overlay}
            onClick={() => setRowMenuIsOpen(false)}
          />,
          document.body,
        )}
      <div
        style={style}
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={() => setRowMenuIsOpen(true)}
        className={cn(
          'absolute inset-0 w-3.5 cursor-grab flex items-center justify-center group bg-pr hover:!bg-primaryHover',
        )}
      >
        <div
          ref={setReferenceElement}
          className={cn('w-full h-3.5 cursor-grab flex items-center justify-center')}
        >
          <div
            className={cn(
              'rotate-90',
              rowIsHovered || rowMenuIsOpen ? 'block' : 'hidden',
              'group-hover:block text-[#A9A9AB] group-hover:text-[#CFDFFF]',
              rowMenuIsOpen && 'text-[#CFDFFF]',
            )}
          >
            <DotsIcon />
          </div>
        </div>
        {rowMenuIsOpen && popover}
      </div>
    </>
  );
};

export default DraggableRowHeader;
