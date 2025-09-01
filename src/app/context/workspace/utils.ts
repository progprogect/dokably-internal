import type { Workspace } from './types';
import { LAST_ACTIVE_WORKSPACE_ID_KEY } from './constants';

export const getActiveWorkspace = (workspaces: Workspace[], skipStorageCheck?: boolean) => {
  const lastActiveWorkspaceId = localStorage.getItem(LAST_ACTIVE_WORKSPACE_ID_KEY);

  if (workspaces.length === 0) return;

  if (lastActiveWorkspaceId && !skipStorageCheck) {
    return workspaces.find((item) => item.id === lastActiveWorkspaceId) || workspaces[0];
  }

  return workspaces[0];
};
