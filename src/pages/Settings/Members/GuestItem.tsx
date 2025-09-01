import { GuestOptionsMap } from './types';
import GuestOptions from './GuestOptions';

import { ReactComponent as Trash } from '@images/trash.svg';

const optionsMap: GuestOptionsMap = {
  guest: {
    title: 'Guest',
    description: 'Can’t change workspace settings and invite new memebers to the workspace.',
    disabled: true,
  },
};

export const GuestItem = ({ name, email, handleDelete, handleChange }: any) => {
  const onSubmit = () => {
    handleChange?.();
  };

  return (
    <div className='flex border-text10 border-b py-3 items-center group'>
      <div className='w-1/2'>
        <div className='text-15-19'>{name}</div>
        <div className='text-12-15 text-text50'>{email}</div>
      </div>
      <div className='relative w-1/2 flex justify-between items-center'>
        <GuestOptions
          selectorName='settings'
          customOptionsMap={optionsMap}
          currentOption={'guest'}
          onSubmit={onSubmit}
        />
        <Trash
          className='mr-2.5 cursor-pointer opacity-0 group-hover:opacity-40 hover:!opacity-100'
          onClick={handleDelete}
        />
      </div>
    </div>
  );
};
