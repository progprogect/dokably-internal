import { ACTION_TYPES } from './constants';
import type {
  Action,
  SetLoadingAction,
  SetShouldInitWorkspaceAction,
  SetActiveWorkspaceAction,
  SetWorkspacesAction,
  Workspace,
  WorkspaceMember,
  SetMembersAction,
  SetGuestsAction,
  SetInviteLinkAction,
} from './types';

const createAction = <T extends string, P>(type: T, payload: P): Action<T, P> => ({
  type,
  payload,
});

export const createSetLoadingAction = (loading: boolean): SetLoadingAction =>
  createAction(ACTION_TYPES.SET_LOADING, loading);

export const createSetWorkspacesAction = (workspaces: Workspace[]): SetWorkspacesAction =>
  createAction(ACTION_TYPES.SET_WORKSPACES, workspaces);

export const createSetActiveWorkspaceAction = (activeWorkspace: Workspace | undefined): SetActiveWorkspaceAction =>
  createAction(ACTION_TYPES.SET_ACTIVE_WORKSPACE, activeWorkspace);

export const createSetShouldInitWorkspaceAction = (flag: boolean): SetShouldInitWorkspaceAction =>
  createAction(ACTION_TYPES.SET_SHOULD_INIT_WORKSPACE, flag);

export const createSetMembersAction = (members: WorkspaceMember[]): SetMembersAction =>
  createAction(ACTION_TYPES.SET_MEMBERS, members);

export const createSetGuestsAction = (guests: WorkspaceMember[]): SetGuestsAction =>
  createAction(ACTION_TYPES.SET_GUESTS, guests);

export const createSetInviteLinkAction = (link: string): SetInviteLinkAction =>
  createAction(ACTION_TYPES.SET_INVITE_LINK, link);
