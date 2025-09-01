import { Unit } from '@entities/models/unit';
import cn from 'classnames';
import cssStyles from './style.module.scss';
import { useLocalStorage } from 'usehooks-ts';
import { track } from '@amplitude/analytics-browser';
import { useDispatch, useSelector } from 'react-redux';
import {
  getModalState,
  updateWhiteboardSettingsModalState,
} from '@app/redux/features/modalsSlice';
import Tippy from '@tippyjs/react';
import { useEditor } from '@tldraw/editor';
import { usePermissionsContext } from '@app/context/permissionsContext/permissionsContext';
import useEmbedded from '@app/hooks/whiteboard/useEmbedded';

const UnitTitle = ({ unit }: { unit: Unit }) => {
  const [isHide] = useLocalStorage('sidebarHidden', false);
  const isEmbedded = useEmbedded();
  const dispatch = useDispatch();
  const { title } = useSelector(getModalState).whiteboardSettingsModalState;
  const { canEditUnit } = usePermissionsContext();

  const openWhiteboardSettingsModal = () => {
    track('whiteboard_settings_popup_opened');
    dispatch(
      updateWhiteboardSettingsModalState({
        isOpen: true,
        title: title,
        unitId: unit.id,
      }),
    );
  };

  const canEdit = canEditUnit(unit.id);

  if (!canEdit) {
    return (
      <div
        className={cn(cssStyles.whiteboardTitle, {
          [cssStyles.whiteboardTitleWithShowSidebarButton]: isHide,
        })}
        style={{ pointerEvents: 'none' }}
      >
        {unit.name}
      </div>
    );
  }

  return (
    <Tippy
      duration={0}
      content={'Click to rename'}
      className={
        '!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[40px] absolute top-[-45px] w-[108px]'
      }
    >
      <div
        className={cn(cssStyles.whiteboardTitle, {
          [cssStyles.whiteboardTitleWithShowSidebarButton]: isHide,
          [cssStyles.embeddedWhiteboardTitle]: isEmbedded,
        })}
        onClick={openWhiteboardSettingsModal}
      >
        {unit.name}
      </div>
    </Tippy>
  );
};

export default UnitTitle;
