import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

export function useEffectOnce(
  effect: EffectCallback,
  condition: () => boolean,
  deps?: DependencyList,
) {
  const wasCalled = useRef<boolean>(false);

  useEffect(() => {
    if (condition() && !wasCalled.current) {
      wasCalled.current = true;
      return effect();
    }
  }, deps);
}
