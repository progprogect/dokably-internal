import { useMemo, useState } from 'react';
import { track } from '@amplitude/analytics-browser';

import { useWorkspaceContext } from '@app/context/workspace/context';
import MemberInvite from '@pages/Settings/Members/MemberInvite';

// import { ReactComponent as Template } from '@images/template.svg';
import { ReactComponent as Help } from '@images/help.svg';
import { ReactComponent as AddUser } from '@images/userAdd.svg';
import styles from './style.module.scss';
import { SubscriptionLimitNotification } from '@pages/Settings/Billing/SubscriptionLimitNotification';

const SidebarBottomActions = () => {
  const { activeWorkspace } = useWorkspaceContext();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const showInvitePeopleBtn = useMemo(() => {
    return activeWorkspace?.userRole === 'owner';
  }, [activeWorkspace]);

  return (
    <div className={styles.sidebarBottomActions}>
      <div
        onClick={() => {
          track('help_opened');
          Object(window).Intercom('show');
        }}
        className={styles.sidebarBottomActionsButton}
      >
        <Help /> Help
      </div>
      {/* <div
        className={cn(styles.sidebarBottomActionsButton, {
          [styles.sidebarBottomActionsButtonDisabled]: true,
        })}
      >
        <Template /> Templates
      </div> */}
      {showInvitePeopleBtn && (
        <div
          onClick={() => setModalIsOpen(true)}
          className={styles.sidebarBottomActionsButtonInvite}
        >
          <AddUser /> Invite people
        </div>
      )}
      <MemberInvite
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
      />
      <SubscriptionLimitNotification />
    </div>
  );
};

export default SidebarBottomActions;
