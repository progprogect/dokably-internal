import { ReactNode } from 'react';

import { WorkspaceContextProvider } from '@app/context/workspace/provider';

import { PermissionsContextProvider } from './permissionsContext/permissionsContext';
import { ChannelsContextProvider } from './channelsContext/channelsContext';
import { UnitsContextProvider } from './unitsContext/unitsContext';
import { SubscriptionContextProvider } from './subscriptionContext/subscriptionContext';

type GeneralContextProviderProps = {
  children: ReactNode;
};

const GeneralContextProvider = ({ children }: GeneralContextProviderProps) => {
  return (
    <WorkspaceContextProvider>
      <PermissionsContextProvider>
        <ChannelsContextProvider>
          <SubscriptionContextProvider>
            <UnitsContextProvider>{children}</UnitsContextProvider>
          </SubscriptionContextProvider>
        </ChannelsContextProvider>
      </PermissionsContextProvider>
    </WorkspaceContextProvider>
  );
};

export default GeneralContextProvider;
