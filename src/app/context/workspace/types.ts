import type { Role } from '@entities/models/role';

import type { ACTION_TYPES } from './constants';

export type WorkspaceUser = {
  id: string;
  name: string;
  email: string;
  deleted: boolean;
};

export type WorkspaceMember = {
  user: WorkspaceUser;
  role: Role;
};

export type Workspace = {
  id: string;
  name: string;
  numberOfMembers: number;
  owner?: WorkspaceUser;
  subscribed: boolean;
  userRole: Role;
};

export type Action<T, P> = {
  readonly type: T;
  readonly payload: P;
};

export type SetLoadingAction = Action<typeof ACTION_TYPES.SET_LOADING, boolean>;
export type SetShouldInitWorkspaceAction = Action<typeof ACTION_TYPES.SET_SHOULD_INIT_WORKSPACE, boolean>;
export type SetWorkspacesAction = Action<typeof ACTION_TYPES.SET_WORKSPACES, Workspace[]>;
export type SetActiveWorkspaceAction = Action<typeof ACTION_TYPES.SET_ACTIVE_WORKSPACE, Workspace | undefined>;
export type SetMembersAction = Action<typeof ACTION_TYPES.SET_MEMBERS, WorkspaceMember[]>;
export type SetGuestsAction = Action<typeof ACTION_TYPES.SET_GUESTS, WorkspaceMember[]>;
export type SetInviteLinkAction = Action<typeof ACTION_TYPES.SET_INVITE_LINK, string>;

export type WorkspaceAction =
  | SetLoadingAction
  | SetShouldInitWorkspaceAction
  | SetWorkspacesAction
  | SetActiveWorkspaceAction
  | SetMembersAction
  | SetGuestsAction
  | SetInviteLinkAction;

export type WorkspaceState = {
  loading: boolean;
  shouldInitWorkspace: boolean;

  workspaces: Workspace[];
  activeWorkspace?: Workspace;

  members: WorkspaceMember[];
  guests: WorkspaceMember[];

  inviteLink: string;
};

export type TWorkspaceContext = {
  loading: boolean;
  shouldInitWorkspace: boolean;

  workspaces: Workspace[];
  activeWorkspace?: Workspace;

  members: WorkspaceMember[];
  activeMembers: WorkspaceMember[];
  guests: WorkspaceMember[];
  activeGuests: WorkspaceMember[];

  inviteLink: string;

  setActiveWorkspace: (workspace: Workspace | undefined) => Promise<void>;

  createWorkspace: (name: string) => Promise<void>;
  editWorkspace: (data: Pick<Workspace, 'id' | 'name'>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  leaveWorkspace: (id: string) => Promise<void>;

  deleteWorkspaceUser: (user: WorkspaceMember) => Promise<void>;
  transferWorkspace: (user: WorkspaceMember) => Promise<void>;
  changeWorkspaceUserRole: (user: WorkspaceMember) => Promise<void>;

  joinWorkspace: (id: string, inviteId: string) => Promise<void>;
  joinWorkspaceUnit: (id: string) => Promise<void>;
};
