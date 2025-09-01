import Button from '@shared/common/Button';
import Modal from '@shared/common/Modal';

const ConfirmOwnershipTransfer = ({ setModalIsOpen, modalIsOpen, onConfirm }: any) => {
  const onConfirmClick = () => {
    onConfirm();
    setModalIsOpen(false);
  };

  const onCancelClick = () => {
    setModalIsOpen(false);
  };

  return (
    <Modal
      modalIsOpen={modalIsOpen}
      closeModal={() => setModalIsOpen(false)}
      closeButton={false}
    >
      <div className='text-20-16 font-medium text-text90'>Are you sure you want to transfer your ownership?</div>
      <div className='w-110 mt-5 text-base text-text70'>
        You’re about to transfer your team ownership to another member. You’ll be downgraded from Owner to Admin. This
        action will be immediate.
      </div>
      <div className='flex mt-14 items-center'>
        <Button
          label='Cancel'
          styleType='small-gray'
          onClick={onCancelClick}
          className='w-full mr-3'
        />
        <Button
          label='Confirm transfer'
          className='!text-errorText w-full'
          styleType='small-gray'
          onClick={onConfirmClick}
        />
      </div>
    </Modal>
  );
};

export default ConfirmOwnershipTransfer;
