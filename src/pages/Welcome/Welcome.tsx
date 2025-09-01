import { useEffect, useState } from 'react';
import { WelcomeMode } from './Welcome.types';
import { useLocation } from 'react-router-dom';
import NewWorkspace from './NewWorkspace/NewWorkspace.component';
import InvitedWorkspaceOrUnit from './InvitedWorkspaceOrUnit';

const WelcomePage = () => {
  const [mode, setMode] = useState<WelcomeMode>();
  const location = useLocation();

  useEffect(() => {
    const param = new URLSearchParams(location.search);
    const returnUrl = param.get('returnURL')
      ? new URL(
          `${window.location.protocol}//${window.location.hostname}:${window.location.port}${param.get('returnURL')}`,
        )
      : null;

    if (
      param.get('returnURL') &&
      returnUrl &&
      returnUrl.searchParams.get('inviteId') &&
      (returnUrl.pathname.indexOf('/workspace/') != -1 || returnUrl.pathname.indexOf('/unit/')) != -1
    ) {
      setMode('invited');
    } else {
      setMode('simple');
    }
  }, []);

  return mode === 'simple' ? <NewWorkspace /> : <InvitedWorkspaceOrUnit />;
};

export default WelcomePage;
