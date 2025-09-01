import { DragOverlay } from '@dnd-kit/core';
import { UnitsDndDragOverlayProps } from './props';
import UnitElement from '../../unit-element';
import { UnitType } from '@entities/models/unit';

function UnitDndDragOverlay<
  U extends { id: string; name: string; type: UnitType; color: string | null },
>({ unit, style, isActive }: UnitsDndDragOverlayProps<U>) {
  return (
    <DragOverlay>
      {unit ? (
        <div
          style={style}
          className='relative z-1 opacity-70 cursor-grabbing'
        >
          <UnitElement
            isActive={isActive}
            showExpandCollapseButton={false}
            unit={unit}
            className='bg-backgroundHover'
          />
        </div>
      ) : null}
    </DragOverlay>
  );
}

export default UnitDndDragOverlay;
