import { WorkspaceMember } from '@entities/models/workspaceMember';

export const findUser = (userId: string, users: WorkspaceMember[]): WorkspaceMember | undefined => {
  return users.find((user) => user.user.id === userId);
};
