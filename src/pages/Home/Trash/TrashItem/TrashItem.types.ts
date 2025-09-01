import { Unit } from '@entities/models/unit';

export interface ITrashItem {
  item: Unit,
  workspaceId: string,
}