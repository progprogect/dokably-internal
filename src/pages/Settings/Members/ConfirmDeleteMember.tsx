import Button from '@shared/common/Button';
import Modal from '@shared/common/Modal';

const ConfirmDeleteMember = ({ setModalIsOpen, modalIsOpen, onDelete }: any) => {
  const onDeleteClick = () => {
    onDelete();
    setModalIsOpen(false);
  }

  const onCancelClick = () => {
    setModalIsOpen(false);
  }

  return (
    <Modal
      modalIsOpen={modalIsOpen}
      closeModal={() => setModalIsOpen(false)}
      closeButton={false}
    >
      <div className='text-20-16 font-medium text-text90'>
        Are you sure you want to delete a member?
      </div>
      <div className='flex mt-14 items-center'>
        <Button
          label='Cancel'
          styleType='small-gray'
          onClick={onCancelClick}
          className='w-full mr-3'
        />
        <Button
          label='Delete'
          className='!text-errorText w-full'
          styleType='small-gray'
          onClick={onDeleteClick}
        />
      </div>
    </Modal>

  );
};

export default ConfirmDeleteMember;
