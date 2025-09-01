export const UNIT_PERMISSION_VIEW = 'view' as const;
export const UNIT_PERMISSION_VIEW_MEMBERS = 'view_members' as const;

export const UNIT_PERMISSION_COMMENT = 'comment' as const;
export const UNIT_PERMISSION_DELETE = 'delete' as const;

export const UNIT_PERMISSION_DUPLICATE = 'duplicate' as const;
export const UNIT_PERMISSION_EDIT = 'edit' as const;

export const UNIT_PERMISSION_MANAGE_MEMBERS = 'manage_members' as const;
// export const UNIT_PERMISSION_SHARE = 'share' as const;
export const UNIT_PERMISSION_SHARE_INVITE = 'share_invite' as const;
export const UNIT_PERMISSION_SHARE_INVITE_LINK = 'share_invite_link' as const;

export const UNIT_PERMISSION_ADD_DOC = 'add_doc' as const;
export const UNIT_PERMISSION_ADD_SUB_DOC = 'add_sub_doc' as const;
export const UNIT_PERMISSION_MENTION_DOC = 'mention_doc' as const;
export const UNIT_PERMISSION_MENTION_WHITEBOARD = 'mention_whiteboard' as const;
export const UNIT_PERMISSION_EMBEDED_WHITEBOARD = 'embeded_whiteboard' as const;

export type Permission =
  | typeof UNIT_PERMISSION_VIEW
  | typeof UNIT_PERMISSION_VIEW_MEMBERS
  | typeof UNIT_PERMISSION_COMMENT
  | typeof UNIT_PERMISSION_DELETE
  | typeof UNIT_PERMISSION_DUPLICATE
  | typeof UNIT_PERMISSION_EDIT
  | typeof UNIT_PERMISSION_MANAGE_MEMBERS
  // | typeof UNIT_PERMISSION_SHARE
  | typeof UNIT_PERMISSION_SHARE_INVITE
  | typeof UNIT_PERMISSION_SHARE_INVITE_LINK
  | typeof UNIT_PERMISSION_ADD_DOC
  | typeof UNIT_PERMISSION_ADD_SUB_DOC
  | typeof UNIT_PERMISSION_MENTION_DOC
  | typeof UNIT_PERMISSION_MENTION_WHITEBOARD
  | typeof UNIT_PERMISSION_EMBEDED_WHITEBOARD;
