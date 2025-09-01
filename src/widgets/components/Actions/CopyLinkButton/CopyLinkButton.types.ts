import { Unit } from '@entities/models/unit';

export interface ICopyLinkButton {
  unit: Unit;
  callback?: any;
}
