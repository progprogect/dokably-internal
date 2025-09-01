import { CSSProperties } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

export const DragAlongCell = ({ cell }: { cell: any }) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition: 'width transform 0.2s ease-in-out',
    width: cell.column.width,
    zIndex: isDragging ? 1 : 0,
    border: '1px solid #d4d4d46d',
    borderTop: 'none',
  };

  const { portalId } = useTableContext();

  return (
    <div
      {...cell.getCellProps()}
      className='td'
      style={{ ...style }}
      ref={setNodeRef}
    >
      {cell.render('Cell', { portalId })}
    </div>
  );
};
