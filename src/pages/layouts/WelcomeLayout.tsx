import cn from 'classnames';

import { ReactComponent as Logo } from '@images/logo.svg';
import { useEffect, useState } from 'react';
import Outlet from '@shared/uikit/outlet';

const WelcomLayaout = () => {
  const [isCompact, setCompact] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    checkWidth();
  }, []);

  const checkWidth = () => {
    const isCompact = window.innerWidth <= 728;
    setCompact(isCompact);
    setWidth(isCompact ? window.innerWidth : window.innerWidth - 256);
  };

  useEffect(() => {
    window.addEventListener('resize', checkWidth, false);
    return () => {
      window.removeEventListener('resize', checkWidth);
    };
  }, []);

  return (
    <div className={cn('h-screen w-screen flex')}>
      {!isCompact && (
        <div className='w-64 bg-menuBackground px-4 py-5 flex justify-between flex-col'>
          <div>
            <div className='flex items-center'>
              <Logo className='w-5 h-5' />
              <div className='w-32 h-4 ml-2 rounded bg-buttonBlack opacity-10' />
            </div>
            <div className='w-full h-8 rounded bg-buttonBlack opacity-10 mt-5' />
            <div className='w-full h-8 rounded bg-buttonBlack mt-2' />
            <div className='px-4 mt-2'>
              <div className='w-full h-4 rounded bg-buttonBlack opacity-10' />
              <div className='w-full h-4 rounded bg-buttonBlack opacity-10 mt-5' />
              <div className='w-full h-4 rounded bg-buttonBlack opacity-10 mt-10' />
              <div className='w-full h-4 rounded bg-buttonBlack opacity-10 mt-5' />
            </div>
          </div>
          <div>
            <div className='px-4'>
              <div className='w-full h-4 rounded bg-buttonBlack opacity-10' />
              <div className='w-full h-4 rounded bg-buttonBlack opacity-10 mt-5' />
              <div className='w-full h-4 rounded bg-buttonBlack opacity-10 mt-5' />
            </div>
            <div className='w-full h-8 rounded bg-buttonBlack opacity-10 mt-5' />
          </div>
        </div>
      )}
      <div className='flex justify-center' style={{ width: `${width}px` }}>
        <Outlet />
      </div>
    </div>
  );
};

export default WelcomLayaout;
