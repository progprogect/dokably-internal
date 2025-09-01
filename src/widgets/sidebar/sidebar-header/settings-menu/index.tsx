import { track } from '@amplitude/analytics-browser';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import cn from 'classnames';

import type { Workspace } from '@app/context/workspace/types';
import { useWorkspaceContext } from '@app/context/workspace/context';
import { logout } from '@app/redux/features/userSlice';

import { ReactComponent as Settings } from '@images/settings.svg';
import { ReactComponent as Arrow } from '@images/arrow.svg';
import { ReactComponent as Help } from '@images/help.svg';
import { ReactComponent as Trash } from '@images/trash.svg';
import { ReactComponent as Logo } from '@images/logo.svg';
import { ReactComponent as Check } from '@images/checkOriginal.svg';
import { ReactComponent as LogOut } from '@images/logout.svg';
import { ReactComponent as Plus } from '@images/plus.svg';
import styles from './style.module.scss';
import { useMemo } from 'react';

type SettingsMenuProps = {
  closeCallback: () => void;
};

const SettingsMenu = ({ closeCallback }: SettingsMenuProps) => {
  const { activeWorkspace, workspaces: workspacesList, setActiveWorkspace } = useWorkspaceContext();

  const workspaces = useMemo(() => {
    return workspacesList.map(w => w.id).includes(activeWorkspace?.id || "")
      ? workspacesList
      : (activeWorkspace ? [activeWorkspace, ...workspacesList] : workspacesList);
  }, [activeWorkspace, workspacesList]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const goToSettings = () => {
    track('settings_opened');
    closeCallback();
  };

  const handleHelp = () => {
    track('help_opened', { source: 'logo' });
    Object(window).Intercom('show');
    closeCallback();
  };

  const goToTrash = () => {
    track('trash_opened');

    closeCallback();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    closeCallback();
  };

  const handleSwitchWorkspace = (workspace: Workspace) => {
    closeCallback();
    setActiveWorkspace(workspace);
    navigate('/home');
  };

  if (!activeWorkspace) return null;

  return (
    <div className={styles.settingsMenu}>
      <Link
        to='/settings/account'
        className={styles.settingsMenuItem}
        onClick={goToSettings}
      >
        <Settings />
        Settings
        <Arrow className={styles.secondaryInlineIcon} />
      </Link>
      <div
        className={styles.settingsMenuItem}
        onClick={handleHelp}
      >
        <Help />
        Help
      </div>
      <Link
        to='/trash'
        className={styles.settingsMenuItem}
        onClick={goToTrash}
      >
        <Trash />
        Trash
      </Link>
      <div className={styles.settingsMenuDivider}></div>
      {workspaces.length > 1 && <div className={styles.settingsMenuWorkspaceListTitle}>Switch workspace</div>}
      {workspaces.map((workspace) => (
        <div
          key={workspace.id}
          className={cn(styles.settingsMenuItem, styles.settingsMenuItem__black)}
          onClick={() => handleSwitchWorkspace(workspace)}
        >
          <Logo />
          {workspace.name}
          {activeWorkspace.id === workspace.id && <Check className={styles.secondaryInlineIcon} />}
        </div>
      ))}
      <div
        className={styles.settingsMenuItem}
        onClick={() => {
          navigate('/new-workspace');
        }}
      >
        <Plus />
        New workspace
      </div>
      <div className={styles.settingsMenuDivider}></div>
      <div
        className={styles.settingsMenuItem}
        onClick={handleLogout}
      >
        <LogOut /> Log out
      </div>
    </div>
  );
};

export default SettingsMenu;
