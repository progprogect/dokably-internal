import { IProperty } from '@widgets/task-board/types';

export const findProperty = (propertyId: string, properties: IProperty[]): IProperty | undefined => {
  return properties.find((p) => p.id === propertyId);
};
