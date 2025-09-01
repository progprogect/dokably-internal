import { useSelector } from 'react-redux';

import Modal from '@shared/common/Modal';
import Button from '@shared/common/Button';

import { selectCurrentUser } from '@app/redux/features/userSlice';

const ChangeEmailSuccess = ({ modalIsOpen, onClose }: any) => {
  const user = useSelector(selectCurrentUser);
  return (
    <Modal modalIsOpen={modalIsOpen} closeModal={onClose}>
      <div className='text-20-16 font-medium text-text90'>
        Success, ‘{user.user?.name}’!
      </div>
      <div className='w-96 mt-5 text-base text-text70'>
        Your email address on Dokably has now been changed to ‘
        {user.user?.email}’.
      </div>
      <div className='w-full flex mt-14 justify-end'>
        <Button label='Ok' styleType='small-gray' onClick={onClose} />
      </div>
    </Modal>
  );
};

export default ChangeEmailSuccess;
