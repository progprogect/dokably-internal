import { useCallback, useState } from 'react';
import { track } from '@amplitude/analytics-browser';
import toast, { LoaderIcon } from 'react-hot-toast';
import _ from 'lodash';

import { useWorkspaceContext } from '@app/context/workspace/context';
// import Button from '@shared/common/Button';
import Modal from '@shared/common/Modal';
import TagsInput from '@shared/common/input/TagsInput';
// import InputBase from '@shared/comm/on/input/InputBase';
import { darkToastOptions, errorToastOptions, successToastOptions } from '@shared/common/Toast';
import { useInviteToWorkspace } from '@app/queries/workspace/useInviteToWorkspace';
import { InviteConfirmation } from '@widgets/components/ShareDoc/InviteConfirmation';

type MemberInviteProps = {
  setModalIsOpen: (flag: boolean) => void;
  modalIsOpen: boolean;
};

const MemberInvite = ({ setModalIsOpen, modalIsOpen }: MemberInviteProps) => {
  const { mutateAsync: inviteToWorkspace, isPending } = useInviteToWorkspace();
  const { activeWorkspace, inviteLink } = useWorkspaceContext();

  const [emails, setEmails] = useState<string[]>([]);

  const handleEmailChange = useCallback((emailsList: string[]) => {
    const emailsToUse = _.filter(emailsList, (item) => Boolean(item));

    if (_.isEmpty(emailsToUse)) {
      return;
    }

    setEmails(emailsToUse);
  }, []);

  const handleSendEmail = useCallback(async () => {
    if (!activeWorkspace?.id) {
      console.error('No workspace id available');
      return;
    }

    track('members_settings_invite_sent_action');

    try {
      await inviteToWorkspace(
        {
          emails,
          role: 'member',
          id: activeWorkspace.id,
        },
        {
          onSuccess: () => {
            toast.success('Invites successfully sent!', successToastOptions);
          },
        },
      );

      setModalIsOpen(false);
    } catch (error: any) {
      track('members_settings_invite_sent_action_failed');
      toast.error(error?.response?.data || 'Invite sending error', errorToastOptions);
    }
  }, [activeWorkspace, emails]);

  const handleCopyClick = () => {
    track('members_settings_invite_link_copied');

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
    <Modal
      closeModal={() => setModalIsOpen(false)}
      modalIsOpen={modalIsOpen}
      userClassName='w-578'
    >
      <div className='text-20-16 font-medium'>Invite members</div>

      {/* <div className='mt-10 flex items-center'>
        <div className='text-sm font-medium text-text90'>Invite via this link</div>
      </div>
      <div className='mt-2 flex'>
        <InputBase
          name='inviteLink'
          disabled
          value={inviteLink}
          className='!w-100 mr-3 shrink-0	'
        />
        <Button
          label='Copy'
          styleType='small-primary'
          className='w-23'
          disabled={!inviteLink}
          onClick={handleCopyClick}
        />
      </div> */}

      <div className='mt-7.5 flex items-center text-sm font-medium text-text90'>Invite via email</div>
      <div className='mt-2 flex'>
        <TagsInput
          className='w-100 mr-3 !overflow-auto'
          placeholder='Enter email'
          onChangeTags={handleEmailChange}
        />
        {/* <Button
          label='Send'
          styleType='small-primary'
          className='w-23'
          onClick={handleSendEmail}
          disabled={!emails.length}
        /> */}
        <InviteConfirmation
          buttonText='Send'
          onButtonClick={handleSendEmail}
          newMembers={emails}
          confirm={!!emails.length}
        />
      </div>
      <div className='text-xs font-medium text-text40 mt-1.5'>
        Please feel free to add multiple emails, separated by comma, space, or new line.
      </div>
        {isPending && (
          <div className="loader">
            <LoaderIcon style={{ width: 40, height: 40 }} />
          </div>
        )}
    </Modal>
  );
};

export default MemberInvite;
