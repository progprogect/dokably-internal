export type AccessTypes = 'view' | /*'comment' |*/ 'edit' | 'full_access' | 'no';

export type ParticipantType = 'member' | 'guest' | 'owner' | 'admin';

export type InviteeType = Exclude<ParticipantType, 'owner' | 'admin'>;

export type AccessState = {
  access: AccessTypes;
  participant: Omit<'owner', ParticipantType>;
  subDocs: boolean;
};

export interface IInviteAcces {
  onApply: (state: AccessState) => void;
  className: string;
  initialState?: Partial<AccessState>;
  hideMembership?: boolean;
  hideAccessLevel?: boolean;
  hasNoAccessLevel?: boolean;
  isButtonLike?: boolean;
  isOnlyTitle?: boolean;
  hasFullAccessLevel?: boolean;
  initialAccessType?: AccessTypes;
  showCanCommentAccessLevel?: boolean;
  toTop?: boolean;
  keepPopupAfterSelect?: boolean;
}