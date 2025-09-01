import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { track } from '@amplitude/analytics-browser';
import { useSelector } from 'react-redux';

import Button from '@shared/common/Button';
import { darkToastOptions } from '@shared/common/Toast';
import { getShareLink } from '@app/services/share.service';
import { getModalState } from '@app/redux/features/modalsSlice';
import { useWorkspaceContext } from '@app/context/workspace/context';

import { InviteAccesOptions } from './InviteAccesOptions';
import { ShareLinkRoleOptionMap, SharingSelector } from './SharingSelector';
import { AccessState, AccessTypes, ParticipantType } from './types';

import { ReactComponent as Link } from '@images/link.svg';
import { ReactComponent as World } from '@images/world.svg';
import './sharedoc.styles.css';

const shareViaLinkRoleOptionsMap: ShareLinkRoleOptionMap = {
  guest: {
    title: 'Anyone with the link',
    description: 'Doc via this link will be available to anyone on the Internet',
    icon: World,
    disabled: false,
    comingSoon: false,
  },
};

export function ShareDocViaLink() {
  const [linkScope, setLinkScope] = useState<ParticipantType>('guest');
  const [linkAccess, setLinkAccess] = useState<Omit<AccessState, 'participant'>>({ access: 'view', subDocs: false });
  const [inviteLink, setInviteLink] = useState('');
  const { activeWorkspace } = useWorkspaceContext();

  const { isOpen, unitId } = useSelector(getModalState).shareModalState;

  useEffect(() => {
    if (isOpen) {
      track('document_share_popup', { option: 'share' });
    }
  }, [isOpen]);

  useEffect(() => {
    async function retrieveLInk() {
      if (!unitId) return;
      if (!activeWorkspace?.id) return;
      try {
        const result = await getShareLink(linkAccess.access, unitId);
        const host = window?.location?.origin || 'http://app.dokably.com';

        setInviteLink(`${host}/workspaces/${activeWorkspace?.id}/units/${unitId}/shared?hash=${result.hash}`);
      } catch (error) {
        console.log(error);
      }
    }

    retrieveLInk();
  }, [linkScope, linkAccess, unitId, isOpen, activeWorkspace?.id]);

  const onChangeSharingScope = (option: ParticipantType) => {
    setLinkScope(option);
  };
  const [initialAccessType, setInitialAccessType] = useState<AccessTypes>('view');

  const onChangeLinkAccessSelector = (option: AccessState) => {
    setLinkAccess({ access: option.access, subDocs: option.subDocs });
    setInitialAccessType(option.access);
  };

  const handleCopyClick = () => {
    track('document_share_link_copied', { option: 'share' });
    navigator.clipboard.writeText(inviteLink).then(
      function () {
        toast('Link copied to clipboard', darkToastOptions);
      },
      function (err) {
        console.error('Async: Could not copy text: ', err);
        toast('Failed to copy link to clipboard', darkToastOptions);
      },
    );
  };

  return (
    <div className='flex space-between width-full'>
      <SharingSelector
        onChange={onChangeSharingScope}
        selectorName='workspace'
        isButtonLike
        customOptionsMap={shareViaLinkRoleOptionsMap}
      />
      <InviteAccesOptions
        className='invite_by_link_access__options'
        onApply={onChangeLinkAccessSelector}
        hideMembership
        hasFullAccessLevel={false}
        initialAccessType={initialAccessType}
        showCanCommentAccessLevel={false}
      />
      <Button
        icon={<Link className='mr-2 [&>path]:stroke-primaryHover' />}
        label='Copy link'
        styleType='input-text'
        className='!text-primaryHover ml-auto font-normal'
        onClick={handleCopyClick}
        disabled={!inviteLink}
      />
    </div>
  );
}
