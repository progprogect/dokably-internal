import Modal from '@shared/common/Modal';
import { useEffect, useMemo, useState } from 'react';
import { LoaderIcon } from 'react-hot-toast';
import { WorkspaceMembersForUnit } from '@entities/models/workspace';
import { InviteByEmail } from './InviteByEmail';
import { getMembersForUnit as getDocumentMembers } from '@app/services/share.service';
import './sharedoc.styles.css';
import { track } from '@amplitude/analytics-browser';
import { useDispatch, useSelector } from 'react-redux';
import { getModalState, updateShareModalState } from '@app/redux/features/modalsSlice';
import { ShareDocViaLink } from './ShareDocViaLink';
import Switch from 'react-switch';
import { usePermissionsContext } from '@app/context/permissionsContext/permissionsContext';
import MembersList from './MembersList';
import { AccessTypes } from './types';

export function ShareDoc() {
  const dispatch = useDispatch();
  const { canShareInviteUnit } = usePermissionsContext();
  const [members, setMembers] = useState<WorkspaceMembersForUnit>([]);
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [viaLinkIsVisible, setViaLinkIsVisible] = useState<boolean>(true);
  const { isOpen, title, unitId } = useSelector(getModalState).shareModalState;
  const emailInvitingIsDisabled = useMemo(() => !canShareInviteUnit(unitId), [canShareInviteUnit, unitId]);

  const getMembers = async () => {
    if (!unitId) return;
    const res = await getDocumentMembers(unitId);
    setMembers(res ?? []);
  };

  const updateMembers = (newAccessLevel: AccessTypes) => {
    setMembers(members => members.map(member => {
      const accessShouldBeUpdated = member.role !== "owner" && member.role !== "guest";
      return { ...member, access: accessShouldBeUpdated ? newAccessLevel : member.access };
    }));
  };

  useEffect(() => {
    if (isOpen) {
      track('document_share_popup', { option: 'share' });
    }
  }, [isOpen]);

  useEffect(() => {
    getMembers();
  }, [unitId, isOpen]);

  const handleClose = () => {
    track('document_share_close');
    dispatch(
      updateShareModalState({
        isOpen: false,
        title: title,
        unitId: '',
      }),
    );
  };

  return (
    <Modal
      title={title ?? 'Share doc'}
      closeModal={handleClose}
      modalIsOpen={isOpen}
      wrapChildren={false}
      userClassName='w-638 !p-10 !animate-none'
      titleClassName='!text-20-16 !font-medium'
      closeBtnClassName='absolute top-6 right-6'
    >
      {isInviting && (
        <div className='absolute inset-0 flex items-center justify-center bg-[#ffffff99] z-10'>
          <LoaderIcon
            style={{ width: 30, height: 30 }}
            className='animate-spin'
          />
        </div>
      )}
      <div
        className='flex flex-col full-width mt-6 z-0'
        contentEditable={false}
      >
        <InviteByEmail
          unitId={unitId}
          isInviting={isInviting}
          setIsInviting={setIsInviting}
          members={members}
          emailInvitingIsDisabled={emailInvitingIsDisabled}
        />
        <div
          className='flex justify-between mt-8 mb-3 cursor-pointer'
          onClick={() => setViaLinkIsVisible((value) => !value)}
        >
          <span className='text-[14px] font-medium'>Share to web</span>
          <Switch
            checked={viaLinkIsVisible}
            onChange={() => undefined}
            uncheckedIcon={false}
            checkedIcon={false}
            onColor='#4A86FF'
            height={24}
            width={44}
            className={`react-switch ${viaLinkIsVisible ? 'active' : 'inactive'}`}
          />
        </div>
        {viaLinkIsVisible && <ShareDocViaLink />}
        <div className='width-full border  border-solid border-text10 my-5' />
        <MembersList
          unitId={unitId}
          members={members}
          getMembers={getMembers}
          updateMembers={updateMembers}
        />
      </div>
    </Modal>
  );
}
