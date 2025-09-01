import { useState } from 'react';

import { capitalizeFirstLetter } from '@app/utils/unitls';

import { RolesOptionsMap } from './types';
import MemberOptions from './MemberOptions';
import ConfirmOwnershipTransfer from './ConfirmOwnershipTransfer';
import ConfirmDeleteMember from './ConfirmDeleteMember';

import { ReactComponent as Trash } from '@images/trash.svg';

const optionsMap: RolesOptionsMap = {
  owner: {
    title: 'Owner',
    description: 'Can change workspace settings and invite new memebers to the workspace.',
    disabled: false,
  },
  member: {
    title: 'Member',
    description: "Can't change workspace settings or invite new members to the workspace.",
    disabled: false,
  },
};

export const MemberItem = ({ name, email, role, handleDelete, handleChange }: any) => {
  const [ownershipTransferModalIsOpen, setOwnershipTransferModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

  const onChange = async () => {
    setOwnershipTransferModalIsOpen(true);
  };

  const onConfirmDelete = () => {
    setDeleteModalIsOpen(true);
  };

  return (
    <>
      <ConfirmOwnershipTransfer
        modalIsOpen={ownershipTransferModalIsOpen}
        setModalIsOpen={setOwnershipTransferModalIsOpen}
        onConfirm={() => handleChange?.()}
      />
      <ConfirmDeleteMember
        modalIsOpen={deleteModalIsOpen}
        setModalIsOpen={setDeleteModalIsOpen}
        onDelete={handleDelete}
      />
      <div className='flex border-text10 border-b py-3 items-center group h-[60px]'>
        <div className='w-1/2'>
          <div className='text-15-19'>{name}</div>
          <div className='text-12-15 text-text50'>{email}</div>
        </div>
        <div className='relative w-1/2 flex justify-between items-center'>
          {role === 'owner' && (
            <div className='text-text leading-[14px] text-[14px]'>{capitalizeFirstLetter(role)}</div>
          )}
          {role !== 'owner' && (
            <>
              <MemberOptions
                onChange={onChange}
                selectorName='settings'
                customOptionsMap={optionsMap}
                currentOption={role}
              />
              <Trash
                className='mr-2.5 cursor-pointer opacity-0 group-hover:opacity-40 hover:!opacity-100'
                onClick={onConfirmDelete}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};
