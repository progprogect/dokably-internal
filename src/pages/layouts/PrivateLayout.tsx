import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { track } from '@amplitude/analytics-browser';

import { userApi } from '@app/redux/api/userApi';
import { useWorkspaceContext } from '@app/context/workspace/context';

import Loading from '@shared/common/Loading';
import Outlet from '@shared/uikit/outlet';

const PrivateLayout = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { shouldInitWorkspace, loading: isLoadingWorkspaces } = useWorkspaceContext();

  useEffect(() => {
    track('app_opened');
  }, []);

  useEffect(() => {
    const returnUrl = searchParams.get('returnURL');
    const inviteId = searchParams.get('inviteId');

    if (shouldInitWorkspace && !returnUrl && !inviteId) navigate('/new-workspace', { replace: true });
  }, [shouldInitWorkspace, searchParams, navigate]);

  const { isLoading, isFetching } = userApi.endpoints.getMe.useQuery(null, {
    skip: false,
  });

  const userData = userApi.endpoints.getMe.useQueryState(null, {
    selectFromResult: ({ data }) => data as Record<string, any>,
  });

  if (isLoading || isFetching || isLoadingWorkspaces) {
    return location.pathname.includes('settings') ? <Outlet /> : <Loading />;
  }

  const goToLogin = () => {
    const loginUrl = `/login?returnURL=${location.pathname}${location.search}`;

    return (
      <Navigate
        to={loginUrl}
        state={{ from: location }}
      />
    );
  };

  return userData?.id ? <Outlet /> : goToLogin();
};

export default PrivateLayout;
