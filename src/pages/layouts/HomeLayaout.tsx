import { useState } from 'react';
import MemberInvite from '@pages/Settings/Members/MemberInvite';
import cn from 'classnames';
import * as _ from 'lodash';
import Sidebar from '@widgets/sidebar';
import Outlet from '@shared/uikit/outlet';

const HomeLayout = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <div className={cn('h-screen w-screen flex')} contentEditable={false}>
      <Sidebar />
      <div id="home-layout" className='home-layout'>
        <Outlet />
      </div>
      <MemberInvite modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} />
    </div>
  );
};

export default HomeLayout;
