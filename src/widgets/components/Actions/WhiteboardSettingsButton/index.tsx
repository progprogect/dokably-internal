import { track } from '@amplitude/analytics-browser';
import { useDispatch, useSelector } from 'react-redux';
import {
  getModalState,
  updateWhiteboardSettingsModalState,
} from '@app/redux/features/modalsSlice';

import { ReactComponent as ChannelSettingsIcon } from '@images/channelSettings.svg';
import { Unit } from '@entities/models/unit';
import ActiveButton from '@shared/uikit/active-button';

const WhiteboardSettingsButton = ({
  unit,
  callback,
}: {
  unit: Unit;
  callback?: any;
}) => {
  const dispatch = useDispatch();
  const { title } = useSelector(getModalState).whiteboardSettingsModalState;

  const openWhiteboardSettingsModal = () => {
    track('whiteboard_settings_popup_opened');
    dispatch(
      updateWhiteboardSettingsModalState({
        isOpen: true,
        title: title,
        unitId: unit.id,
      })
    );
    callback && callback();
  };

  return (
    <ActiveButton leftSection={<ChannelSettingsIcon />} onClick={openWhiteboardSettingsModal}>
      Whiteboard settings
    </ActiveButton>
  )
};

export default WhiteboardSettingsButton;
