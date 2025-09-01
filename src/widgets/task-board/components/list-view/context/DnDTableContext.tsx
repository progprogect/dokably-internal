import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ReactElement, useCallback, useState } from 'react';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

function DnDTableContext<D extends { id: string }>({
  children,
  onDragEnd,
  onDragStart,
  data,
}: {
  data: D[];
  onDragEnd?: (event: DragEndEvent) => void;
  onDragStart?: (event: DragStartEvent) => void;
  children: (context: {
    activeUnit: D | null;
    overUnit: D | null;
  }) => ReactElement;
}) {
  const [activeUnit, setActiveUnit] = useState<D | null>(null);
  const [overUnit, setOverUnit] = useState<D | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        tolerance: 5,
        delay: 100,
      },
    }),
    useSensor(KeyboardSensor),
    useSensor(MouseSensor),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveUnit(event.active.data.current?.unit);
      onDragStart?.(event);
    },
    [onDragStart],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      onDragEnd?.(event);
      setActiveUnit(null);
      setOverUnit(null);
    },
    [onDragEnd],
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverUnit(event.over?.data.current?.unit);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
      onDragCancel={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={data}
        strategy={verticalListSortingStrategy}
      >
        {children({ activeUnit, overUnit })}
      </SortableContext>
    </DndContext>
  );
}

export default DnDTableContext;
