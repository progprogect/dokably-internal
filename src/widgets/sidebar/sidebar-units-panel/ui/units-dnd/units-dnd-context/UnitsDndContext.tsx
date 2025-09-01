import { closestCenter, DndContext, DragEndEvent, DragMoveEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { UnitsDndContextProps } from './props';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useCallback, useMemo, useState } from 'react';
import { TreeNodeMetadata } from '@widgets/sidebar/sidebar-units-panel/types';

const isWhiteboard = <U extends { type: TreeNodeMetadata['type'] }>(item: U) => item.type === 'whiteboard';

const isChannel = <U extends { type: TreeNodeMetadata['type'] }>(item: U) => item.type === 'channel';

export const isWhiteboardMaxLevel = <U extends { level: TreeNodeMetadata['level'] }>(item: U) => item.level > 2;

function UnitsDndContext({ children, onDragEnd, data }: UnitsDndContextProps) {
  const [activeUnit, setActiveUnit] = useState<TreeNodeMetadata | null>(null);
  const [overUnit, setOverUnit] = useState<TreeNodeMetadata | null>(null);
  const [parentUnit, setParentUnit] = useState<TreeNodeMetadata | null>(null);

  const disabled = useMemo(() => {
    const disabledSet = new Set<string | number>();
    if (!activeUnit) return disabledSet;

    data.forEach((node) => {
      if (node.metadata) {
        if (isChannel(node.metadata)) {
          disabledSet.add(node.id);
        }
        if (isWhiteboard(activeUnit) && isWhiteboardMaxLevel(node.metadata)) {
          disabledSet.add(node.id);
        }
      }
    });

    return disabledSet;
  }, [activeUnit, data]);

  const readonly = useMemo(() => {
    const readonlySet = new Set<string | number>();
    data.forEach((node) => {
      if (node.metadata && isChannel(node.metadata)) readonlySet.add(node.id);
    });
    return readonlySet;
  }, [data]);

  const canInsert = overUnit ? !disabled.has(overUnit.id) : false;

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveUnit(active.data.current?.unit);
    setParentUnit(active.data.current?.unit.parent?.metadata);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      onDragEnd?.(event, { canInsert });
      setActiveUnit(null);
      setOverUnit(null);
      setParentUnit(null);
    },
    [onDragEnd, canInsert],
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverUnit(event.over?.data.current?.unit);
  }, []);

  const handleDragMove = ({ over }: DragMoveEvent) => {
    setParentUnit(over?.data.current?.unit.parent?.metadata);
  };

  return (
    <DndContext
      onDragMove={handleDragMove}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
      onDragCancel={handleDragEnd}
    >
      <SortableContext
        items={data}
        strategy={verticalListSortingStrategy}
      >
        {children({
          activeUnit,
          overUnit,
          parentUnit,
          disabled,
          canInsert,
          readonly,
        })}
      </SortableContext>
    </DndContext>
  );
}

export default UnitsDndContext;
