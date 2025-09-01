export const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_WORKSPACES: 'SET_WORKSPACES',
  SET_ACTIVE_WORKSPACE: 'SET_ACTIVE_WORKSPACE',
  SET_MEMBERS: 'SET_MEMBERS',
  SET_GUESTS: 'SET_GUESTS',
  SET_SHOULD_INIT_WORKSPACE: 'SET_SHOULD_INIT_WORKSPACE',
  SET_INVITE_LINK: 'SET_INVITE_LINK',
} as const;

export const initialState = {
  loading: false,
  shouldInitWorkspace: false,

  workspaces: [],
  activeWorkspace: undefined,

  members: [],
  guests: [],

  inviteLink: '',
};

export const LAST_ACTIVE_WORKSPACE_ID_KEY = 'LAST_ACTIVE_WORKSPACE_ID_KEY';
