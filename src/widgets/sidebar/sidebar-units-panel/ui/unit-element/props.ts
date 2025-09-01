type NewUnit = {
  parentId: string;
  type: 'document' | 'whiteboard';
};

export type UnitElementProps<U> = {
  isActive?: boolean;
  showExpandCollapseButton?: boolean;
  isExpanded?: boolean;
  unit: U;
  className?: string;
  onExpand?: (isExpanded: boolean, unitId: string) => void;
  onCreateUnit?: (newUnit: NewUnit) => void;
};
