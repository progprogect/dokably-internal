import { SecurityRespone } from '@app/redux/api/authApi';

export interface IInvitedWorkspace {
  email: string;
  security: SecurityRespone;
  workspaceId: string;
}