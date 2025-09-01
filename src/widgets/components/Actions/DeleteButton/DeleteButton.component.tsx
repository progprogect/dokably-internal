import { IDeleteButton } from './DeleteButton.types';
import { useDispatch } from 'react-redux';
import {
  updateDeleteModalState,
} from '@app/redux/features/modalsSlice';

import { ReactComponent as Delete } from '@images/trash.svg'
import ActiveButton from '@shared/uikit/active-button';

const DeleteButton = ({ unit, callback }: IDeleteButton) => {
  const dispatch = useDispatch();

  const handleOpenConfirmation = () => {
    dispatch(
      updateDeleteModalState({
        isOpen: true,
        title: 'Delete',
        unitId: unit.id,
      })
    );
    callback && callback();
  };

  return (
    <ActiveButton onClick={handleOpenConfirmation} leftSection={<Delete />}>
      Delete
    </ActiveButton>
  );
};

export default DeleteButton;
