import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ComponentType, lazy } from 'react';
import './styles/index.scss';
import './styles/index.css';
import EmailVerificationPage from '@pages/EmailVerification';
import GeneralSettings from '@pages/Settings/General';
import HomeLayout from '@pages/layouts/HomeLayaout';
import MembersSettings from '@pages/Settings/Members';
import PrivateLayout from '@pages/layouts/PrivateLayout';
import ResetPasswordPage from '@pages/ResetPassword';
import SingUpPage from '@pages/SignUp';
import WorkspacePage from '@pages/Workspace';
import UpdatePasswordPage from '@pages/UpdatePassword';
import WelcomLayaout from '@pages/layouts/WelcomeLayout';
import { Join } from '@pages/Join';
import NoMatch from '@pages/Errors/NoMatch';
import ErrorBoundary from '@pages/Errors';
import ServerError from '@pages/Errors/ServerError';
import SettingsLayout from '@pages/layouts/SettingsLayout';
import AccountSettings from '@pages/Settings/Account';
import ChannelSettings from '@widgets/components/Modals/ChannelSettings/ChannelSettings.component';
import { ShareDoc } from '@widgets/components/ShareDoc';
import DeleteConfirmation from '@widgets/components/Modals/DeleteConfirmation/DeleteConfirmation.component';
import DeleteBoardConfirmation from '@widgets/components/Modals/DeleteConfirmation/DeleteBoardConfirmation.component';
import AuthLayaout from '@pages/layouts/AuthLayout/AuthLayout.component';
import Login from '@pages/Login/Login.component';
import WhiteboardSettings from '@widgets/components/Modals/WhitboardSettings';
import TrashPage from '@pages/Home/Trash/TrashPage.component';
import WorkspaceListContainer from '@pages/WorkspaceList/WorkspaceListContainer';
import WorkspaceRemovedContainer from '@pages/WorkspaceRemoved/WorkspaceRemovedContainer';
import { Providers } from './Providers';
import GlobalSearch from '@widgets/components/Modals/GlobalSearch';
import CurrentPlan from '@pages/Settings/Billing/current-plan';
import Upgrade from '@pages/Settings/Billing/Upgrade';

export const lazyMinLoadTime = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  minLoadTimeMs = 2000,
) =>
  lazy(() =>
    Promise.all([factory(), new Promise((resolve) => setTimeout(resolve, minLoadTimeMs))]).then(
      ([moduleExports]) => moduleExports,
    ),
  );

const WelcomePage = lazyMinLoadTime(() => import('@pages/Welcome/Welcome'), 1);

const CreateWorkspace = lazyMinLoadTime(() => import('@pages/CreateWorkspace/CreateWorkspace'), 1);

const Home = lazyMinLoadTime(() => import('@pages/Home'), 1);
const Workspace = lazyMinLoadTime<any>(() => import('@pages/Home/workspace/Workspace'), 1);

const GuestViewInitialPage = lazyMinLoadTime(() => import('@pages/GuestView/GuestViewInitialPage'), 1);

const GuestViewUnitPage = lazyMinLoadTime<any>(() => import('@pages/GuestView/GuestViewUnitPage'), 1);

const Routing = () => {
  return (
    <Routes>
      <Route element={<PrivateLayout />}>
        <Route element={<HomeLayout />}>
          <Route
            path='/'
            element={
              <Navigate
                replace
                to='/home'
              />
            }
          />
          <Route
            path='/home'
            element={<Home />}
          />
          <Route
            path='/workspace/:documentId'
            element={<Workspace />}
          />
          <Route
            path='/trash'
            element={<TrashPage />}
          />
        </Route>
        <Route element={<SettingsLayout />}>
          <Route
            path='/settings'
            element={
              <Navigate
                replace
                to='/settings/account'
              />
            }
          />
          <Route
            path='/settings/account'
            element={<AccountSettings />}
          />
          <Route
            path='/settings/general'
            element={<GeneralSettings />}
          />
          <Route
            path='/settings/members'
            element={<MembersSettings />}
          />
          <Route
            path='/settings/current-plan'
            element={<CurrentPlan />}
          />
          <Route
            path='/settings/upgrade'
            element={<Upgrade />}
          />
          {/* <Route path='/settings/billing-details' element={<BillingDetails/>} />  */}
        </Route>
        <Route
          path='/unit/:unitId'
          element={<Join />}
        />
        <Route
          path='/unit/:unitId/join'
          element={<Join />}
        />
        <Route
          path='/workspace/:workspaceId/unit/:unitId/join'
          element={<Join />}
        />
        <Route
          path='/workspaces'
          element={<WorkspaceListContainer />}
        />
        <Route
          path='/workspaces/:workspaceId'
          element={<WorkspacePage />}
        />
        <Route
          path='/workspaces/:id/removed'
          element={<WorkspaceRemovedContainer />}
        />
        <Route
          path='/workspaces/:workspaceId/units/:unitId/guest'
          element={<GuestViewUnitPage />}
        />
      </Route>

      <Route
        path='workspaces/:workspaceId/units/:unitId/shared'
        element={<GuestViewInitialPage />}
      />

      <Route element={<WelcomLayaout />}>
        <Route
          path='/welcome'
          element={<WelcomePage />}
        />
        <Route
          path='/new-workspace'
          element={<CreateWorkspace />}
        />
      </Route>

      <Route element={<AuthLayaout />}>
        <Route
          path='/login'
          element={<Login />}
        />
        <Route
          path='/sign-up'
          element={<SingUpPage />}
        />
        <Route
          path='/email-verification'
          element={<EmailVerificationPage />}
        />
        <Route
          path='/forgot-password'
          element={<ResetPasswordPage />}
        />
        <Route
          path='/reset-password'
          element={<UpdatePasswordPage />}
        />
      </Route>

      <Route
        path='*'
        element={<NoMatch />}
      />
      <Route
        path='/404'
        element={<NoMatch />}
      />
      <Route
        path='/500'
        element={<ServerError />}
      />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary action={() => (window.location.href = '/home')}>
      <Providers>
        <BrowserRouter>
          <Routing />
          <ChannelSettings />
          <ShareDoc />
          <DeleteConfirmation />
          <DeleteBoardConfirmation />
          <WhiteboardSettings />
          <GlobalSearch />
        </BrowserRouter>
      </Providers>
    </ErrorBoundary>
  );
}

export default App;
