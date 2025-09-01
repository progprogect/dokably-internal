import Button from '@shared/common/Button';
import Modal from '@shared/common/Modal';
import { useEffect, useState } from 'react';
import './style.css';
import { getChannel, updateChannel } from '@app/services/channel.service';
import { useDispatch, useSelector } from 'react-redux';
import { selectUnits, updateUnit } from '@app/redux/features/unitsSlice';
import { Unit } from '@entities/models/unit';
import { PRIVATE_CHANNEL_NAME } from '@app/constants/defaults';
import { getModalState, updateChannelSettingsModalState } from '@app/redux/features/modalsSlice';
import { track } from '@amplitude/analytics-browser';
import toast from 'react-hot-toast';
import { successToastOptions } from '@shared/common/Toast';
import { useWorkspaceContext } from '@app/context/workspace/context';

type AccessType = 'Open' | 'Private';

const ChannelSettings = () => {
  const [channelName, setChannelName] = useState<string>('');
  const [isDefault, setDefault] = useState<boolean>(false);
  const [state, setState] = useState<AccessType>('Open' as AccessType);
  const { activeWorkspace } = useWorkspaceContext();

  const units = useSelector(selectUnits).units;

  const { isOpen, title, unitId } = useSelector(getModalState).channelSettingsModalState;

  const dispatch = useDispatch();

  useEffect(() => {
    if (unitId && activeWorkspace) {
      getChannel(unitId, activeWorkspace.id).then((channel) => {
        setChannelName(channel.name);
        setState(channel.privacy === 'private' ? 'Private' : 'Open');
        setDefault(channel.byDefault);
      });
    }
  }, [isOpen, activeWorkspace, unitId]);

  const save = () => {
    if (unitId) {
      const privacy = state === 'Open' ? 'public' : 'private';
      updateChannel(unitId, channelName, privacy);

      const currentUnit = {
        ...units.find((unit: Unit) => unit.id === unitId),
      } as Unit;

      if (currentUnit) {
        currentUnit.name = channelName;
        dispatch(updateUnit(currentUnit));
      }

      toast.success('Channel settings updated', successToastOptions);
      handleClose();
    }
  };

  const handleClose = () => {
    track('channel_settings_popup_closed');
    dispatch(
      updateChannelSettingsModalState({
        isOpen: false,
        title: title,
        unitId: '',
      }),
    );
  };

  return (
    <Modal
      title='Channel settings'
      closeModal={handleClose}
      modalIsOpen={isOpen}
      wrapChildren={true}
      userClassName='channel-settings__modal'
    >
      <div
        className='channel-settings'
        contentEditable={false}
      >
        <div className='channel-settings__label'>Channel name</div>
        <div className='channel-settings__row'>
          <input
            type='text'
            placeholder='New channel'
            className='channel-settings__row__input'
            value={!isDefault ? channelName : PRIVATE_CHANNEL_NAME}
            onChange={(event) => setChannelName(event.target.value)}
            disabled={isDefault}
          />
        </div>
        <div className='channel-settings__row__button-row'>
          <Button
            label='Save'
            styleType='small-primary'
            disabled={channelName.length < 5}
            onClick={() => save()}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ChannelSettings;
