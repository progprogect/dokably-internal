import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router';
import { Link, useNavigate } from 'react-router-dom';
import Countdown, { CountdownRenderProps } from 'react-countdown';
import { track } from '@amplitude/analytics-browser';
import { toast } from 'react-hot-toast';

import { successToastOptions } from '@shared/common/Toast';
import { useGuestLoginMutation } from '@app/redux/api/authApi';

import { ReactComponent as Loader } from '@images/loader.svg';

const INIT = 'init';
const PROCESSING = 'processing';
const SUCCESS = 'success';
const ERROR = 'error';

type JoinStatus = typeof INIT | typeof PROCESSING | typeof SUCCESS | typeof ERROR;

const GuestViewInitialPage = () => {
  const { search } = useLocation();
  const { unitId, workspaceId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<JoinStatus>(INIT);
  const inviteId = new URLSearchParams(search).get('hash');
  const [guestLogin] = useGuestLoginMutation();

  useEffect(() => {
    if (!inviteId || !unitId) {
      setStatus(ERROR);
      return;
    }

    const authenticateGuest = async () => {
      setStatus(PROCESSING);
      try {
        await guestLogin({ hash: inviteId }).unwrap();
      } catch (error) {
        track('document open_failed', { reason: JSON.stringify(error) });
        setStatus(ERROR);
      }

      track('document_open', { document_id: unitId, source: 'invitation' });
      toast.success('Invitation accepted', successToastOptions);
      setStatus(SUCCESS);
    };

    authenticateGuest();
  }, []);

  useEffect(() => {
    if (status === SUCCESS) {
      setTimeout(() => {
        navigate(`/workspaces/${workspaceId}/units/${unitId}/guest`);
      }, 5000);
    }
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
};

export default GuestViewInitialPage;
