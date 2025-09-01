import { AccessTypes, InviteeType } from "./types";

type AccessLabelsType = Record<AccessTypes, string>

export const AccessLabels: AccessLabelsType = {
  full_access: 'Full access',
  edit: 'Edit',
  // comment: 'Comment',
  view: 'View only',
  no: 'No access',
};

export const AccessDescriptions: AccessLabelsType = {
  full_access: 'Can edit, delete, move, share the Doc, and change the Doc settings.',
  edit: 'Can edit and share the Doc. Can’t delete, move, or change the Doc settings.',
  // comment: 'Can only comment and suggest. Can’t edit or share the doc with others.',
  view: 'Read-only. Can’t comment, edit, or share the doc with others.',
  no: 'No access',
};

export const ACCESS_TYPES = Object.keys(AccessLabels) as AccessTypes[];

export const INVITEE_TYPES: InviteeType[] = ['member', 'guest'];

type InviteeTypeLabels = Record<InviteeType, string>;

export const INVITEE_TYPES_LABELS: InviteeTypeLabels = {
  member: 'Member',
  guest: 'Guest',
};
