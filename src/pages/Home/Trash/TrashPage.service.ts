import { Unit } from '@entities/models/unit';
import { getDeletedUnits } from '@app/services/unit.service';

export const getRemovedItems = async (
  workspaceId: string
): Promise<Unit[]> => {
  return await getDeletedUnits(workspaceId);
};
