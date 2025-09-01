import { cn } from '@app/utils/cn';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { STATIC_COLUMNS } from '../../../list-table.model';

export function DraggableHeaderCell({ columnId, children, sticky, ...props }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: columnId });
  const isDraggable = columnId !== STATIC_COLUMNS.NAME;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    ...props.style,
  };
  
  return (
    <div
      ref={setNodeRef}
      {...(isDraggable ? attributes : {})}
      {...(isDraggable ? listeners : {})}
      style={style}
      className={cn({ 'sticky left-0 z-[2]': sticky, relative: !sticky }, props.className)}
    >
      {children}
    </div>
  );
}