import { ACTION_TYPES } from './constants';
import type { WorkspaceState, WorkspaceAction } from './types';

export const reducer = (draft: WorkspaceState, { type, payload }: WorkspaceAction): void => {
  switch (type) {
    case ACTION_TYPES.SET_LOADING: {
      draft.loading = payload;

      break;
    }

    case ACTION_TYPES.SET_WORKSPACES: {
      draft.workspaces = payload;

      break;
    }

    case ACTION_TYPES.SET_ACTIVE_WORKSPACE: {
      draft.activeWorkspace = payload;

      break;
    }

    case ACTION_TYPES.SET_SHOULD_INIT_WORKSPACE: {
      draft.shouldInitWorkspace = payload;

      break;
    }

    case ACTION_TYPES.SET_MEMBERS: {
      draft.members = payload;

      break;
    }

    case ACTION_TYPES.SET_GUESTS: {
      draft.guests = payload;

      break;
    }

    case ACTION_TYPES.SET_INVITE_LINK: {
      draft.inviteLink = payload;

      break;
    }

    default: {
      break;
    }
  }
};
