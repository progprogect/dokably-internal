import Button from '@shared/common/Button';
import Modal from '@shared/common/Modal';
import { useEffect, useState } from 'react';
import './style.css';
import { useDispatch, useSelector } from 'react-redux';
import { renameUnit, selectUnits } from '@app/redux/features/unitsSlice';
import { getModalState, updateWhiteboardSettingsModalState } from '@app/redux/features/modalsSlice';
import { track } from '@amplitude/analytics-browser';
import toast from 'react-hot-toast';
import { successToastOptions } from '@shared/common/Toast';
import { getUnit } from '@app/services/unit.service';
import { Unit } from '@entities/models/unit';
import { useWorkspaceContext } from '@app/context/workspace/context';

const WhiteboardSettings = () => {
  const [whiteboardName, setWhiteboardName] = useState<string>('');
  const units = useSelector(selectUnits).units;

  const { activeWorkspace } = useWorkspaceContext();

  const { isOpen, title, unitId } = useSelector(getModalState).whiteboardSettingsModalState;

  const dispatch = useDispatch();

  useEffect(() => {
    if (unitId && activeWorkspace) {
      getUnit(unitId, activeWorkspace.id).then((whiteboard) => {
        if (whiteboard) {
          setWhiteboardName(whiteboard.name);
        }
      });
    }
  }, [isOpen, activeWorkspace, unitId]);

  const save = () => {
    if (unitId) {
      const currentUnit = { ...units.find((x) => x.id === unitId) } as Unit;
      if (currentUnit) {
        currentUnit.name = whiteboardName;
        dispatch(renameUnit(currentUnit as Unit));
        toast.success('Whiteboard settings updated', successToastOptions);
      }
      handleClose();
    }
  };

  const handleClose = () => {
    track('whiteboard_settings_popup_closed');
    dispatch(
      updateWhiteboardSettingsModalState({
        isOpen: false,
        title: title,
        unitId: '',
      }),
    );
  };

  return (
    <Modal
      title='Whiteboard settings'
      closeModal={handleClose}
      modalIsOpen={isOpen}
      wrapChildren={true}
      userClassName='whiteboard-settings__modal'
    >
      <div
        className='whiteboard-settings'
        contentEditable={false}
      >
        <div className='whiteboard-settings__label'>Whiteboard name</div>
        <div className='whiteboard-settings__row'>
          <input
            type='text'
            placeholder='Whiteboard name'
            className='whiteboard-settings__row__input'
            value={whiteboardName}
            onChange={(event) => setWhiteboardName(event.target.value)}
          />
        </div>
        <div className='whiteboard-settings__row__button-row'>
          <Button
            label='Save'
            styleType='small-primary'
            disabled={whiteboardName.length < 5}
            onClick={() => save()}
          />
        </div>
      </div>
    </Modal>
  );
};

export default WhiteboardSettings;
