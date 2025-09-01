import { UnitType } from '@entities/models/unit';

export type Unit = {
  id: string;
  type: UnitType;
};

type NewUnit = {
  parentId: string;
  type: 'document' | 'whiteboard';
};

export type UnitActionsPanelProps<U extends Unit> = {
  unit: U;
  className?: string;
  onCreateUnit?: (newUnit: NewUnit) => void;
};
