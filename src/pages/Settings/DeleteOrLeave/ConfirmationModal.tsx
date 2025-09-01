import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useWorkspaceContext } from '@app/context/workspace/context';
import Modal from '@shared/common/Modal';
import Button from '@shared/common/Button';

import { RemoveWorkspaceMode } from './types';

type DeleteOrLeaveConfirmationModalProps = {
  close: () => void;
  isOpen: boolean;
  mode: RemoveWorkspaceMode;
};

export const DeleteOrLeaveConfirmationModal = ({ close, isOpen, mode }: DeleteOrLeaveConfirmationModalProps) => {
  const navigate = useNavigate();
  const { activeWorkspace, loading, leaveWorkspace, deleteWorkspace } = useWorkspaceContext();

  const [modalClass, setModalClass] = useState('invisible');

  const title = useMemo(() => (mode === 'delete' ? 'Delete workspace' : 'Leave workspace'), [mode]);
  const confirmBtnLabel = useMemo(() => (mode === 'delete' ? 'Delete workspace' : 'Leave workspace'), [mode]);

  const handleDeleteWorkspace = useCallback(async () => {
    if (!activeWorkspace?.id) return;

    try {
      await deleteWorkspace(activeWorkspace.id);

      close();
      navigate(`/workspaces/${activeWorkspace.id}/removed?mode=${mode}&name=${activeWorkspace.name}`);
    } finally {
      close();
    }
  }, [deleteWorkspace, activeWorkspace, close, mode]);

  const handleLeaveWorkspace = useCallback(async () => {
    if (!activeWorkspace?.id) return;

    try {
      await leaveWorkspace(activeWorkspace.id);
      close();
      navigate(`/workspaces/${activeWorkspace.id}/removed?mode=${mode}&name=${activeWorkspace.name}`);
    } finally {
      close();
    }
  }, [leaveWorkspace, activeWorkspace, close, mode]);

  const onConfirmBtnClick = useCallback(() => {
    if (mode === 'delete') void handleDeleteWorkspace();
    else void handleLeaveWorkspace();
  }, [mode, handleDeleteWorkspace, handleLeaveWorkspace]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return setModalClass('invisible');
    }

    setTimeout(() => {
      setModalClass('');
    }, 0);
  }, [isOpen]);

  if (!activeWorkspace) return null;

  return (
    <Modal
      modalIsOpen={isOpen}
      closeModal={close}
      closeButton={false}
      userClassName={modalClass}
    >
      <div
        className='text-20-16 font-medium text-text90'
        contentEditable='false'
      >
        {title}
      </div>
      <div className='w-96 mt-5 text-base text-text70'>
        This action cannot be undone. This will permanently delete your entire workspace. It means that all channels,
        documents, and whiteboards, ie all the workspace knowledge will be deleted. Are you sure you want to proceed?
      </div>
      <div className='mt-4 font-medium text-16-28 text-errorText'>{activeWorkspace.name}</div>
      <div className='flex mt-10 items-center'>
        <Button
          label='Cancel'
          styleType='small-gray'
          onClick={close}
          className='w-full mr-3'
        />
        <Button
          label={confirmBtnLabel}
          className='!text-errorText w-full'
          styleType='small-gray'
          onClick={onConfirmBtnClick}
          isLoading={loading}
          disabled={loading}
        />
      </div>
    </Modal>
  );
};
