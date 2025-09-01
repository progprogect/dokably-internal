import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import cn from 'classnames';
import DotsIcon from '../img/Dots';

import ReactDOM from 'react-dom';
import cssStyles from './style.module.scss';

import { Column } from '@tanstack/react-table';
import { TableRow } from '@widgets/editor/plugins/blocks/Table/Table.types';
import usePopper from '@app/hooks/usePopper';
import { ColumnMenu } from './ColumnMenu';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

export const DraggableColumnHeader = ({
  column,
  permanent = false,
  columnHoverId,
  hoverTable,
}: {
  column: Column<TableRow, unknown>;
  permanent?: boolean;
  columnHoverId?: string;
  hoverTable?: boolean;
}) => {
  const [columnMenuIsOpen, setColumnMenuIsOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: column.id,
  });
  const { portalId } = useTableContext();

  const columnIsHovered = columnHoverId === column.id || permanent;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    width: column.getSize(),
    background: columnMenuIsOpen ? '#4A86FF' : columnIsHovered ? '#d4d4d4' : hoverTable ? '#eaeaea' : '',
  };

  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);

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
      <ColumnMenu
        columnId={column.id}
        setShowHeaderMenu={setColumnMenuIsOpen}
      />
    ),
  });
  return (
    <>
      {columnMenuIsOpen &&
        ReactDOM.createPortal(
          <div
            className={cssStyles.overlay}
            onClick={() => setColumnMenuIsOpen(false)}
          />,
          document.body,
        )}
      <th
        style={style}
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={() => {
          setColumnMenuIsOpen(true);
        }}
        className={cn('p-0 w-full group', 'bg-transparent')}
      >
        <div
          ref={setReferenceElement}
          className={cn(
            'w-full h-3.5 cursor-grab flex items-center justify-center',
            'hover:bg-primaryHover',
            columnMenuIsOpen && 'bg-primaryHover',
          )}
        >
          <div
            className={cn(
              columnIsHovered || columnMenuIsOpen ? 'block' : 'hidden',
              'group-hover:block text-[#A9A9AB] group-hover:text-[#CFDFFF]',
              columnMenuIsOpen && 'text-[#CFDFFF]',
            )}
          >
            <DotsIcon />
          </div>
        </div>
        {columnMenuIsOpen && popover}
      </th>
    </>
  );
};

export default DraggableColumnHeader;
