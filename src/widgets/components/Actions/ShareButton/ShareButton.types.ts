import { Unit } from '@entities/models/unit';

export interface IShareButton {
  unit: Unit;
  withIcon: boolean;
  callback?: any;
}
