import { KeyboardEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { track } from '@amplitude/analytics-browser';

import { IChannel } from '@entities/models/IChannel';
import { Unit } from '@entities/models/unit';
import { useWorkspaceContext } from '@app/context/workspace/context';
import Button from '@shared/common/Button';
import Modal from '@shared/common/Modal';
import { useChannelsContext } from '@app/context/channelsContext/channelsContext';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';
import { successToastOptions } from '@shared/common/Toast';

import './style.css';

const CreateChannel = ({ isOpen, handleClose }: { isOpen: boolean; handleClose: () => void }) => {
  const { addUnit } = useUnitsContext();
  const { activeWorkspace } = useWorkspaceContext();
  const navigate = useNavigate();

  const [channelName, setChannelName] = useState<string>('');

  const [isLoading, setLoading] = useState<boolean>(false);

  const { createNewChannel } = useChannelsContext();

  const handleCreateChannel = async () => {
    setLoading(true);
    track('create_channel_action');

    if (activeWorkspace) {
      createNewChannel(activeWorkspace.id, channelName, 'public')
        .then(async (unit: IChannel) => {
          await addUnit({
            id: unit.id,
            name: unit.name,
            type: 'channel',
            parentUnit: null,
            color: unit.color,
          } as Unit);
          setLoading(false);
          toast.success(`Channel '${channelName}' successfully created`, successToastOptions);
          handleClose();
          setChannelName('');
          navigate(`workspace/${unit.id}`);
        })
        .catch((error) => {
          track('create_channel_action_failed', {
            reason: JSON.stringify(error),
          });
        });
    } else {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateChannel();
    };
  };

  return (
    <Modal
      title='Create new channel'
      closeModal={() => handleClose()}
      modalIsOpen={isOpen}
      wrapChildren={true}
      userClassName='create-new-channel__modal'
    >
      <div className='create-new-channel'>
        <div className='create-new-channel__label'>Channel name</div>
        <div className='create-new-channel__row'>
          <input
            type='text'
            placeholder='New channel'
            className='create-new-channel__row__input'
            value={channelName}
            onChange={(event) => setChannelName(event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className='create-new-channel__row__button-row'>
          <Button
            label='Create channel'
            styleType='small-primary'
            disabled={channelName.length < 3 || isLoading}
            onClick={handleCreateChannel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CreateChannel;
