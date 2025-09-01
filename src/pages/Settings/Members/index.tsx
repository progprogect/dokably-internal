import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { track } from '@amplitude/analytics-browser';
import { Plus } from 'lucide-react';

import type { WorkspaceMember } from '@app/context/workspace/types';
import { cn } from '@app/utils/cn';
import { useWorkspaceContext } from '@app/context/workspace/context';
import Button from '@shared/common/Button';

import { MemberItem } from './MemberItem';
import { GuestItem } from './GuestItem';
import MemberInvite from './MemberInvite';

type Tabs = 'members' | 'guests';

const MembersSettings = () => {
  const navigate = useNavigate();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tabs>('members');

  const {
    activeMembers: members,
    activeGuests: guests,
    activeWorkspace,
    deleteWorkspaceUser,
    transferWorkspace,
    changeWorkspaceUserRole,
  } = useWorkspaceContext();

  useEffect(() => {
    track('members_settings_opened');
  }, []);

  const handleTransferOwnership = useCallback(
    async (user: WorkspaceMember) => {
      await transferWorkspace(user);

      navigate('/workspaces', { replace: true });
    },
    [transferWorkspace],
  );

  return (
    <>
      <MemberInvite
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
      />
      <div className='flex justify-between items-center'>
        <ul className='flex'>
          <li
            className={cn(
              `text-2xl mr-10 relative flex items-center`,
              activeTab === 'members' ? 'text-text90' : 'text-text50',
            )}
          >
            <button onClick={() => setActiveTab('members')}>Members ({members.length})</button>
          </li>
          <li
            className={cn(
              `text-2xl mr-10 relative flex items-center`,
              activeTab === 'guests' ? 'text-text90' : 'text-text50',
            )}
          >
            <button onClick={() => setActiveTab('guests')}>Guests ({guests.length})</button>
          </li>
        </ul>
        <Button
          label='Invite'
          styleType='small-primary'
          onClick={() => {
            track('members_settings_invite_action');
            setModalIsOpen(true);
          }}
          className='pl-3'
          icon={<Plus className='mr-1.5 [&>path]:stroke-white' />}
        />
      </div>
      <div className='mt-9 border-t border-text10'>
        {activeTab === 'members' &&
          members.map((item) => (
            <MemberItem
              key={item.user.email}
              id={item.user.id}
              name={item.user.name}
              email={item.user.email}
              role={item.role === 'owner' ? 'owner' : 'member'}
              workspaceId={activeWorkspace?.id}
              handleChange={() => handleTransferOwnership(item)}
              handleDelete={() => deleteWorkspaceUser(item)}
            />
          ))}
        {activeTab === 'guests' &&
          guests.map((item) => (
            <GuestItem
              key={item.user.email}
              id={item.user.id}
              name={item.user.name}
              email={item.user.email}
              workspaceId={activeWorkspace?.id}
              handleChange={() => changeWorkspaceUserRole(item)}
              handleDelete={() => deleteWorkspaceUser(item)}
            />
          ))}
      </div>
    </>
  );
};

export default MembersSettings;
