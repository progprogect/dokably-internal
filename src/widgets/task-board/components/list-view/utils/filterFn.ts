import { WorkspaceMember } from '@entities/models/workspaceMember';
import { ITask } from '@widgets/task-board/types';
import { findProperty } from './findProperty';
import { findPropertyOption, PropertyOption } from './findPropertyOption';
import { findUser } from './findUser';

export const assigneeFilterFn = (task: ITask, propertyId: string, filterValue: string, users?: WorkspaceMember[]) => {
  const taskProperty = findProperty(propertyId, task.properties);
  if (!taskProperty || !users) return false;

  const user = findUser(taskProperty.value[0], users);
  if (!user) return false;

  return user.user.email.toLowerCase().startsWith(filterValue.toLowerCase());
};

export const propertiesFilterFn = (
  task: ITask,
  propertyId: string,
  filterValue: string,
  propertyOptions?: PropertyOption[],
) => {
  const taskProperty = findProperty(propertyId, task.properties);
  if (!taskProperty || !propertyOptions) return false;

  const option = findPropertyOption(taskProperty.value, propertyOptions);
  if (!option) return false;

  return option.name.toLowerCase().startsWith(filterValue.toLowerCase());
};
