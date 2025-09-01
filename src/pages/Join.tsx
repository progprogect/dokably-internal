import { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation, useParams } from 'react-router';
import { Link, useNavigate } from 'react-router-dom';
import Countdown, { CountdownRenderProps } from 'react-countdown';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@amplitude/analytics-browser';
import { toast } from 'react-hot-toast';

import { checkLink } from '@app/services/joinUnit.service';
import { checkWOrkspaceInviteLink } from '@app/services/joinWorkspace';
import { successToastOptions } from '@shared/common/Toast';
import { logout, selectCurrentUser } from '@app/redux/features/userSlice';

import { ReactComponent as Loader } from '@images/loader.svg';
import { useWorkspaceContext } from '@app/context/workspace/context';

const INIT = 'init';
const PROCESSING = 'processing';
const SUCCESS = 'success';
const ERROR = 'error';
const REDIRECTING_GUEST = 'redirecting_guest';

type JoinStatus = typeof INIT | typeof PROCESSING | typeof SUCCESS | typeof ERROR | typeof REDIRECTING_GUEST;

export function Join() {
  const { search } = useLocation();
  const { unitId, workspaceId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<JoinStatus>(INIT);
  const inviteId = new URLSearchParams(search).get('inviteId');
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const { joinWorkspaceUnit } = useWorkspaceContext();

  // Ref to hold the latest status value for use in async callbacks
  const statusRef = useRef<JoinStatus>(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    // Order of conditions is important for clarity and correctness.

    // 1. If guest redirection is already in progress, do nothing further in this effect run.
    if (status === REDIRECTING_GUEST) {
      return;
    }

    // 2. If token exists but Redux user state isn't fully populated, wait.
    const tokenExists = !!localStorage.getItem('tokens');
    if (tokenExists && !currentUser.isLoggedIn) {
      // Waiting for currentUser to be populated. Effect re-runs when currentUser changes.
      return;
    }

    // 3. If user is identified as an anonymous guest, initiate logout and redirect.
    if (currentUser.user && currentUser.user.email === 'anonymous') {
      setStatus(REDIRECTING_GUEST); // Set status to handle in the next effect run via condition 1.
      dispatch(logout());
      const returnURL = workspaceId
        ? `/workspace/${workspaceId}/unit/${unitId}/join?inviteId=${inviteId}`
        : `/unit/${unitId}/join?inviteId=${inviteId}`;
      navigate(`/login?returnURL=${encodeURIComponent(returnURL)}`, { replace: true });
      return; // Exit: effect will re-run due to setStatus.
    }

    // 4. If not handling a guest and user data is available (or no token),
    //    and if status is INIT, proceed to process the invitation link.
    if (status === INIT) {
      if (!inviteId || !unitId) {
        setStatus(ERROR);
        return;
      }

      setStatus(PROCESSING);

      if (workspaceId && !unitId) {
        checkWOrkspaceInviteLink(workspaceId, inviteId)
          .then(async () => {
            if (statusRef.current === PROCESSING) {
              track('workspace_invite_accepted', { workspace_id: workspaceId, source: 'invitation' });
              toast.success('Invitation accepted', successToastOptions);
              setStatus(SUCCESS);
            }
          })
          .catch((error) => {
            if (statusRef.current === PROCESSING) {
              track('workspace_invite_failed', { reason: JSON.stringify(error) });
              setStatus(ERROR);
            }
          });
      } else if (workspaceId && unitId) {
        checkLink(unitId, inviteId)
          .then(async () => {
            if (statusRef.current === PROCESSING) {
              track('document_open', { document_id: unitId, source: 'invitation' });
              toast.success('Invitation accepted', successToastOptions);
              setStatus(SUCCESS);
            }
          })
          .catch((error) => {
            if (statusRef.current === PROCESSING) {
              track('document open_failed', { reason: JSON.stringify(error) });
              setStatus(ERROR);
            }
          });
      }
    }
  }, [currentUser, status, dispatch, inviteId, unitId, workspaceId, navigate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (status === SUCCESS) {
        if (workspaceId && !unitId) {
          navigate(`/workspace/${workspaceId}`);
          return;
        }

        if (workspaceId && unitId) {
          joinWorkspaceUnit(workspaceId).then(() => {
            navigate(`/workspace/${unitId}`);
          });
          return;
        }
      }
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [status, unitId, workspaceId]);

  if (status === INIT || status === PROCESSING) {
    return (
      <div className='fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center'>
        <Loader className='inline w-12 h-12 text-primary animate-spin' />
        <h2 className='text-center text-xl font-medium'>Checking invitation link...</h2>
        <p className='w-1/3 text-center'>This may take a few seconds, please don't close this page.</p>
      </div>
    );
  }

  if (status === SUCCESS) {
    return (
      <div className='fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center'>
        <h2 className='text-center text-xl font-medium'>All good! Redirecting you to the document...</h2>
      </div>
    );
  }

  const renderer = ({ seconds, completed }: CountdownRenderProps) => {
    if (completed) {
      // Render a completed state
      return (
        <Navigate
          to='/home'
          replace
        />
      );
    } else {
      // Render a countdown
      return <span>{seconds}</span>;
    }
  };

  return (
    <div className='fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center'>
      <h2 className='text-center text-xl font-medium'>
        Provided link is invalid or you don't have permission to access the document
      </h2>
      <p className='w-1/3 text-center'>
        you will be redirected to the main page in{' '}
        <Countdown
          date={Date.now() + 10000}
          renderer={renderer}
        />
      </p>
      <Link to='/home'>Main page</Link>
    </div>
  );
}
