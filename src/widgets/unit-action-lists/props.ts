import { Unit } from '@entities/models/unit';

export interface UnitActionListProps {
  unit: Unit | null;
  callback?: any;
}
