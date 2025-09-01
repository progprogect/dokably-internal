import { ITask } from '@widgets/task-board/types';
import { findPropertyOption, PropertyOption } from './findPropertyOption';
import { findProperty } from './findProperty';
import { WorkspaceMember } from '@entities/models/workspaceMember';
import { findUser } from './findUser';

type ComparePropertyOptionFn = (propertyA: PropertyOption, propertyB: PropertyOption) => number;

const textCompareFn: ComparePropertyOptionFn = (propertyA, propertyB) => {
  return propertyA.name.localeCompare(propertyB.name);
};

const makePropertiesSortingFn = (compareFn: ComparePropertyOptionFn) => {
  return (taskA: ITask, taskB: ITask, propertyId: string, propertyOptions?: PropertyOption[]): number => {
    const propertyA = findProperty(propertyId, taskA.properties);
    const propertyB = findProperty(propertyId, taskB.properties);

    if (!propertyOptions || !propertyA?.value || !propertyB?.value) return 0;

    const propertyAOption = findPropertyOption(propertyA.value, propertyOptions);
    const propertyBOption = findPropertyOption(propertyB.value, propertyOptions);

    if (!propertyAOption || !propertyBOption) return 0;
    return compareFn(propertyAOption, propertyBOption);
  };
};

export const textPropertiesSortingFn = makePropertiesSortingFn(textCompareFn);

export const assigneeSortingFn = (taskA: ITask, taskB: ITask, propertyId: string, users?: WorkspaceMember[]) => {
  const propertyA = findProperty(propertyId, taskA.properties);
  const propertyB = findProperty(propertyId, taskB.properties);

  if (!users || !propertyA?.value || !propertyB?.value) return 0;

  const propertyAOption = findUser(propertyA.value[0], users);
  const propertyBOption = findUser(propertyB.value[0], users);

  if (!propertyAOption || !propertyBOption) return 0;
  return propertyAOption.user.email.localeCompare(propertyBOption.user.email);
};
