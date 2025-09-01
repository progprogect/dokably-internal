import { Active, Over } from '@dnd-kit/core';

export function dndUnitGetter<U>(dndElement: Active | Over | null): U | null {
  if (!dndElement || !dndElement.data.current) return null;
  return dndElement.data.current.unit as U;
}
