import { useEffect, useRef } from 'react';

import { UnitType } from '@entities/models/unit';

import { UnitsDndSideEffectsProps } from './props';

function UnitsDndSideEffects<U extends { id: string; hasChildren?: boolean; type: UnitType }>({
  overUnit,
  activeUnit,
  expanded,
  onExpand,
  onExpandSet,
}: UnitsDndSideEffectsProps<U>): null {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeUnitInitialExpandedState = useRef<string[] | null>(null);

  useEffect(() => {
    if (!overUnit || activeUnit?.type === 'whiteboard') return;

    const clearTimeoutRef = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    clearTimeoutRef();

    timerRef.current = setTimeout(() => {
      onExpand(true, overUnit.id);
    }, 2000);

    return () => clearTimeoutRef();
  }, [activeUnit?.type, onExpand, overUnit]);

  // Preserve main state when getting activeUnit
  useEffect(() => {
    if (activeUnit && !activeUnitInitialExpandedState.current) {
      activeUnitInitialExpandedState.current = expanded;
    }
  }, [activeUnit, expanded]);

  useEffect(() => {
    if (activeUnit && activeUnit.hasChildren) {
      onExpand(false, activeUnit.id);
    }
  }, [activeUnit, onExpand]);

  // Restore main state when unit is dropped
  useEffect(() => {
    if (!activeUnit && activeUnitInitialExpandedState.current) {
      onExpandSet(activeUnitInitialExpandedState.current);
      activeUnitInitialExpandedState.current = null;
    }
  }, [activeUnit, onExpandSet]);

  return null;
}

export default UnitsDndSideEffects;
