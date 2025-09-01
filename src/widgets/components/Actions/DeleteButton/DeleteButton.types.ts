import { Unit } from '@entities/models/unit';

export interface IDeleteButton {
  unit: Unit;
  callback?: any;
}
