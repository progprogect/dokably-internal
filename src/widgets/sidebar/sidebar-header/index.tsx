import { useLocalStorage } from 'usehooks-ts';
import Tippy from '@tippyjs/react';

import { useClickOutside } from '@app/hooks/useClickOutside';
import { useWorkspaceContext } from '@app/context/workspace/context';

import SettingsMenu from './settings-menu';

import { ReactComponent as Logo } from '@images/logo.svg';
import { ReactComponent as Hide } from '@images/doubleArrow.svg';
import styles from './style.module.scss';

const SidebarHeader = () => {
  const { activeWorkspace } = useWorkspaceContext();
  const [, hideSidebar] = useLocalStorage('sidebarHidden', false);

  const settingsMenuClick = useClickOutside(false);

  return (
    <div
      ref={settingsMenuClick.ref}
      className={styles.sidebarHeader}
    >
      <div
        className='row hover:bg-backgroundHover p-2 rounded-[6px]'
        onClick={() => settingsMenuClick.setIsVisible(!settingsMenuClick.isVisible)}
      >
        <Logo className={styles.sidebarHeaderLogo} />
        <div className={styles.sidebarHeaderWorkspaceName}>{activeWorkspace?.name}</div>
      </div>

      <Tippy
        duration={0}
        content='Hide sidebar'
        className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
      >
        <div
          className={styles.sidebarHeaderHideIcon}
          onClick={() => hideSidebar(true)}
        >
          <Hide />
        </div>
      </Tippy>
      {settingsMenuClick.isVisible && (
        <SettingsMenu
          closeCallback={() => {
            settingsMenuClick.setIsVisible(false);
          }}
        />
      )}
    </div>
  );
};

export default SidebarHeader;
