import { useEffect, useRef } from 'react';

type UnitsDndSideEffectsProps<U, E> = {
  activeUnit: U | null;
  expanded: E;
  onExpandedReset: (expanded: E) => void;
  onCollapse: (element: U) => void;
};

function UnitsDndSideEffects<U extends { id: string }, E>({
  activeUnit,
  expanded,
  onExpandedReset,
  onCollapse,
}: UnitsDndSideEffectsProps<U, E>): null {
  const activeUnitInitialExpandedState = useRef<E | null>(null);

  useEffect(() => {
    if (!activeUnit) return;
    onCollapse(activeUnit);
  }, [activeUnit, onCollapse]);

  // Preserve main state when getting activeUnit
  useEffect(() => {
    if (activeUnit && !activeUnitInitialExpandedState.current) {
      activeUnitInitialExpandedState.current = expanded;
    }
  }, [activeUnit, expanded]);

  // Restore main state when unit is dropped
  useEffect(() => {
    if (!activeUnit && activeUnitInitialExpandedState.current) {
      onExpandedReset(activeUnitInitialExpandedState.current);
      activeUnitInitialExpandedState.current = null;
    }
  }, [activeUnit, onExpandedReset]);

  return null;
}

export default UnitsDndSideEffects;
