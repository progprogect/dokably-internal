import { IShareButton } from './ShareButton.types';
import { useMemo } from 'react';
import { track } from '@amplitude/analytics-browser';
import { useDispatch } from 'react-redux';
import { updateShareModalState } from '@app/redux/features/modalsSlice';
import cssStyles from './style.module.scss';
import { ReactComponent as ShareIconComponent } from '@images/share.svg';
import { usePermissionsContext } from '@app/context/permissionsContext/permissionsContext';
import ActiveButton from '@shared/uikit/active-button';

const ShareButton = ({ unit, withIcon, callback }: IShareButton) => {
  const dispatch = useDispatch();
  const { canShareInviteUnit } = usePermissionsContext();

  const isBtnEnabled = useMemo(
    () => canShareInviteUnit(unit.id),
    [canShareInviteUnit, unit.id],
  );

  const title = useMemo(() => {
    if (unit.type === 'document') {
      return 'Share doc';
    }
    if (unit.type === 'channel') {
      return 'Share channel';
    }

    if (unit.type === 'whiteboard') {
      return 'Share whiteboard';
    }

    return 'Share doc';
  }, [unit.type]);

  const openShareModal = () => {
    track('channel_settings_share_action');
    dispatch(
      updateShareModalState({
        isOpen: true,
        title: title,
        unitId: unit.id,
      }),
    );
    callback && callback();
  };

  // if (!isBtnEnabled) {
  //   return null;
  // }

  return (
    <>
      {withIcon ? (
        <ActiveButton leftSection={<ShareIconComponent />} onClick={openShareModal}>
          Share
        </ActiveButton>
      ) : (
        <button
          className={cssStyles.share}
          onClick={openShareModal}
        >
          Share
        </button>
      )}
    </>
  );
};

export default ShareButton;
