import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CSSProperties } from 'react';

import { cn } from '@app/utils/cn';
import { UnitType } from '@entities/models/unit';

import WithDndHandler from '../with-dnd-handler';

import { UnitsDndElementProps } from './props';

function UnitsDndElement<
  U extends { id: string; type: UnitType; level: number },
>({
  unit,
  className,
  children,
  style: propsStyle,
  disabled,
  readonly,
}: UnitsDndElementProps<U>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
  } = useSortable({
    id: unit.id,
    data: { unit },
    disabled,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    pointerEvents: disabled ? 'none' : 'auto',
    ...propsStyle,
  };

  return (
    <WithDndHandler
      ref={setNodeRef}
      style={style}
      handlerVisibility={readonly ? 'hidden' : 'default'}
      handlerProps={{
        ...attributes,
        ...listeners,
        ref: setActivatorNodeRef,
      }}
      className={cn(className)}
    >
      {children}
    </WithDndHandler>
  );
}

export default UnitsDndElement;
