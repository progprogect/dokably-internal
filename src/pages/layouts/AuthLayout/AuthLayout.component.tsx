import { ReactComponent as Curve } from '@images/curve.svg';
import cssStyles from './style.module.scss';
import Outlet from '@shared/uikit/outlet';

type AuthLayaoutProps = {
  children?: React.ReactNode;
};

const AuthLayaout: React.FC<AuthLayaoutProps> = ({ children }) => {
  return (
    <div className={cssStyles.page}>
      <div className={cssStyles.header}>
        <a href='http://dokably.com'>
          <img
            src='https://static.tildacdn.com/tild6438-3563-4464-b738-326362383139/Group_935.svg'
            alt='Logo'
          />
        </a>
      </div>
      <div className={cssStyles.background}>
        <Curve />
      </div>
      <div className={cssStyles.workspace}>
        <div className={cssStyles.window}>
          {children ? children : <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default AuthLayaout;
