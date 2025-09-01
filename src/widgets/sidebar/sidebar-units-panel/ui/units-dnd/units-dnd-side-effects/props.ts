export type UnitsDndSideEffectsProps<U> = {
  activeUnit: U | null;
  overUnit: U | null;
  onExpand: (isExpanded: boolean, elementId: string) => void;
  onExpandSet: (expanded: string[]) => void;
  expanded: string[];
};
