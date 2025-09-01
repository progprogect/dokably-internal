import { IChannelSettingsButton } from './ChannelSettingsButton.types';
import { track } from '@amplitude/analytics-browser';
import { useDispatch, useSelector } from 'react-redux';
import {
  getModalState,
  updateChannelSettingsModalState,
} from '@app/redux/features/modalsSlice';

import { ReactComponent as ChannelSettingsComponent } from '@images/channelSettings.svg';
import ActiveButton from '@shared/uikit/active-button';

const ChannelSettingsButton = ({ unit, callback }: IChannelSettingsButton) => {
  const dispatch = useDispatch();
  const { title } = useSelector(getModalState).channelSettingsModalState;

  const openChannelSettingsModal = () => {
    track('channel_settings_popup_opened');
    dispatch(
      updateChannelSettingsModalState({
        isOpen: true,
        title: title,
        unitId: unit.id,
      })
    );
    callback && callback();
  };

  return (
    <ActiveButton leftSection={<ChannelSettingsComponent />} onClick={openChannelSettingsModal}>
      Channel settings
    </ActiveButton>
  )
};

export default ChannelSettingsButton;
