import { useCallback, useMemo, useState } from 'react';

import { useWorkspaceContext } from '@app/context/workspace/context';
import useUser from '@app/hooks/useUser';
import Button from '@shared/common/Button';

import { DeleteOrLeaveConfirmationModal } from './ConfirmationModal';
import { RemoveWorkspaceMode } from './types';

export const DeleteOrLeave = () => {
  const user = useUser();
  const { activeWorkspace } = useWorkspaceContext();

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setModalIsOpen(true);
  }, []);

  const mode: RemoveWorkspaceMode = useMemo(() => {
    if (!activeWorkspace || !user) {
      return 'leave';
    }

    if (user.id === activeWorkspace.owner?.id) {
      return 'delete';
    }

    return 'leave';
  }, [user, activeWorkspace]);

  if (!activeWorkspace) return null;
  if (!user) return null;

  return (
    <>
      {mode === 'delete' && (
        <>
          <div className='font-medium text-lg3 text-text90 mt-7.5'>Delete workspace</div>
          <div className='font-normal leading-[18px] text-sm text-text50 mt-4'>
            This action cannot be undone. This will permanently delete the workspace, including all
            <br />
            pages and files. Please type the name of the workspace to confirm.
          </div>
        </>
      )}
      <div className='mt-5 flex items-center'>
        {mode === 'leave' && (
          <Button
            label='Leave workspace'
            className='mr-3'
            styleType='small-gray'
            onClick={openModal}
          />
        )}
        {mode === 'delete' && (
          <Button
            label='Delete workspace'
            className='!text-errorText'
            styleType='small-gray'
            onClick={openModal}
          />
        )}
      </div>
      <DeleteOrLeaveConfirmationModal
        mode={mode}
        isOpen={modalIsOpen}
        close={() => setModalIsOpen(false)}
      />
    </>
  );
};
