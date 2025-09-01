import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { track } from '@amplitude/analytics-browser';
import cn from 'classnames';

import { useWorkspaceContext } from '@app/context/workspace/context';
import { selectCurrentUser } from '@app/redux/features/userSlice';
import Outlet from '@shared/uikit/outlet';

import { ReactComponent as User } from '@images/user.svg';
import { ReactComponent as Settings } from '@images/settings.svg';
import { ReactComponent as Arrow } from '@images/arrow.svg';
import { ReactComponent as Payment } from '@images/payment.svg';
import { ReactComponent as Upgrade } from '@images/upgrade.svg';

const SettingsLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const { activeWorkspace } = useWorkspaceContext();

  const handleBack = () => {
    setTimeout(() => {
      navigate('/home');
    }, 300);
  };

  useEffect(() => {
    track('settings_page_opened');
  }, []);

  return (
    <div
      className={cn('h-screen w-screen flex')}
      contentEditable={false}
    >
      <div className='w-65 bg-menuBackground px-1.5 pt-5 pb-2.5'>
        <div
          className='ml-1 flex items-center font-medium text-sm3l text-text90 cursor-pointer'
          onClick={handleBack}
        >
          <Arrow className='rotate-180 mr-2' />
          Back
        </div>
        <div className='ml-2.5 mt-5 font-medium text-text20 text-xs2'>ACCOUNT</div>
        <div
          onClick={() => {
            track('my_settings_opened');
            navigate('/settings/account');
          }}
          className={cn(
            'mx-1 flex items-center pl-3 py-2.25 rounded-md cursor-pointer hover:bg-backgroundHover mt-1.5 opacity-70 hover:opacity-100',
            { 'bg-backgroundHover': location.pathname.includes('account') },
          )}
        >
          <User />
          <div className='ml-3 text-sm3l'>My settings</div>
        </div>
        <div className='ml-2.5 mt-5 font-medium text-text20 text-xs2'>WORKSPACE</div>
        <div
          onClick={() => navigate('/settings/general')}
          className={cn(
            'flex items-center pl-3 py-2.25 rounded-md cursor-pointer hover:bg-backgroundHover mt-1.5 opacity-70 hover:opacity-100',
            { 'bg-backgroundHover': location.pathname.includes('general') },
          )}
        >
          <Settings />
          <div className='ml-3 text-sm3l'>General</div>
        </div>
        {activeWorkspace?.owner?.id === user?.user?.id && (
          <>
            <div
              onClick={() => navigate('/settings/members')}
              className={cn(
                'flex items-center pl-3 py-2.25 rounded-md cursor-pointer hover:bg-backgroundHover mt-1.5 opacity-70 hover:opacity-100',
                { 'bg-backgroundHover': location.pathname.includes('members') },
              )}
            >
              <User />
              <div className='ml-3 text-sm3l'>Members</div>
            </div>
            <div className='flex items-center ml-2.5 mt-5 font-medium text-text20 text-xs2 relative'>BILLING</div>
            <div
              onClick={() => navigate('/settings/current-plan')}
              className={cn(
                'flex items-center pl-3 py-2.25 rounded-md cursor-pointer hover:bg-backgroundHover mt-1.5 opacity-70 hover:opacity-100',
                { 'bg-backgroundHover': location.pathname.includes('current-plan') },
              )}
            >
              <Payment />
              <div className='ml-3 text-sm3l'>Current plan</div>
            </div>
            <div
              onClick={() => navigate('/settings/upgrade')}
              className={cn(
                'flex items-center pl-3 py-2.25 rounded-md cursor-pointer hover:bg-backgroundHover mt-1.5 opacity-70 hover:opacity-100',
                { 'bg-backgroundHover': location.pathname.includes('upgrade') },
              )}
            >
              <Upgrade />
              <div className='ml-3 text-sm3l'>Upgrade</div>
            </div>
          </>
        )}
      </div>
      <div className='grow pt-15 flex justify-center overflow-auto'>
        <div
          className='min-w-settings'
          style={{ width: location.pathname.includes('settings/upgrade') ? 'calc(100% - 92px)' : 'auto' }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
