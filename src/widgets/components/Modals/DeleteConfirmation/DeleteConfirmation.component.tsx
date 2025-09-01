import Modal from '@shared/common/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { removeUnit, selectUnits, setDeletedUnits } from '@app/redux/features/unitsSlice';
import { getModalState, updateDeleteModalState } from '@app/redux/features/modalsSlice';
import { useEffect, useMemo, useState } from 'react';
import { Unit } from '@entities/models/unit';
import Button from '@shared/common/Button';
import { deleteUnit, getDeletedUnits } from '@app/services/unit.service';
import { track } from '@amplitude/analytics-browser';
import toast from 'react-hot-toast';
import { successToastOptions } from '@shared/common/Toast';
import { capitalizeFirstLetter } from '@app/utils/unitls';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkspaceContext } from '@app/context/workspace/context';

import cssStyles from './style.module.scss';

const DeleteConfirmation = () => {
  const dispatch = useDispatch();
  const { activeWorkspace } = useWorkspaceContext();
  const units = useSelector(selectUnits).units;
  const { isOpen, title, unitId } = useSelector(getModalState).deleteModalState;

  const [customTitle, setCustomTitle] = useState<string>();
  const [unit, setUnit] = useState<Unit>();

  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const unit = units.find((x) => x.id === unitId);
      if (unit) {
        setUnit(unit);
        setCustomTitle(`Delete ${unit.type}`);
      }
    }
  }, [isOpen, unitId]);

  const handleDelete = async () => {
    if (activeWorkspace && unit) {
      const _unit = { ...unit } as Unit;
      dispatch(removeUnit(unit));

      const units = await getDeletedUnits(activeWorkspace.id);
      dispatch(setDeletedUnits(units));

      await deleteUnit(_unit.id);

      let deletedUnits = await getDeletedUnits(activeWorkspace.id);

      track(`${_unit.type}_delete_action`);
      toast.success(`${capitalizeFirstLetter(_unit.type)} '${_unit.name}' has been deleted`, successToastOptions);
      if (window.location.pathname.includes(unit.id)) {
        if (_unit.parentUnit) {
          navigate(`/workspace/${_unit.parentUnit.id}`);
        } else {
          navigate('/home');
        }
      }
      dispatch(setDeletedUnits(deletedUnits));
      handleClose();
    }
  };

  const handleClose = () => {
    dispatch(
      updateDeleteModalState({
        isOpen: false,
        title: title,
        unitId: '',
      }),
    );
    setCustomTitle(undefined);
    setUnit(undefined);
  };

  const description = useMemo(() => {
    if (unit?.type === 'document') {
      return (
        <>
          This action can be undone. You can restore your document in the{' '}
          <Link
            to='/trash'
            className='text-fontBlue cursor-pointer'
          >
            Trash.
          </Link>{' '}
          Do you want to continue?
        </>
      );
    } else {
      return <>This action cannot be undone. Do you want to continue?</>;
    }
  }, [unit?.type]);

  return (
    <Modal
      title={customTitle ?? title}
      closeModal={() => handleClose()}
      modalIsOpen={isOpen}
      wrapChildren={false}
      titleClassName='!text-20-16 !font-medium'
      userClassName='w-[500px] !p-10 !animate-none'
      closeBtnClassName='absolute top-6 right-6'
    >
      <div className={cssStyles.wrapper}>
        <div className={cssStyles.message}>{description}</div>
        <div className={cssStyles.unitName}>{unit?.name}</div>
        <div className={cssStyles.actions}>
          <Button
            label='Cancel'
            styleType='small-gray'
            onClick={() => handleClose()}
            className='w-full mr-3'
          />
          <Button
            label={customTitle ?? title}
            className='!text-errorText w-full'
            styleType='small-gray'
            onClick={handleDelete}
          />
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmation;
