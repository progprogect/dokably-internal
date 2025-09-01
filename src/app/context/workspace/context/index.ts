import { createContext, useContext } from 'react';

import type { TWorkspaceContext, Workspace, WorkspaceMember } from '../types';

export const WorkspaceContext = createContext<TWorkspaceContext>({
  loading: false,
  shouldInitWorkspace: false,

  workspaces: [],
  activeWorkspace: undefined,

  members: [],
  activeMembers: [],
  guests: [],
  activeGuests: [],

  inviteLink: '',

  setActiveWorkspace: (_: Workspace | undefined) => Promise.resolve(),

  createWorkspace: (_: string) => Promise.resolve(),
  editWorkspace: (_: Pick<Workspace, 'id' | 'name'>) => Promise.resolve(),
  leaveWorkspace: (_: string) => Promise.resolve(),
  deleteWorkspace: (_: string) => Promise.resolve(),

  deleteWorkspaceUser: (_: WorkspaceMember) => Promise.resolve(),
  transferWorkspace: (_: WorkspaceMember) => Promise.resolve(),
  changeWorkspaceUserRole: (_: WorkspaceMember) => Promise.resolve(),

  joinWorkspace: (_: string, __: string) => Promise.resolve(),
  joinWorkspaceUnit: (_: string) => Promise.resolve(),
});

export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error('useWorkspaceContext was used outside of its provider');
  }

  return context;
};
