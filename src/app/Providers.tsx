import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, ReactNode, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './redux/store';
import GeneralContextProvider from './context/GeneralContextProvider';
import { Toaster } from 'react-hot-toast';

interface Props {
  children: ReactNode;
}

export const Providers: FC<Props> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 0,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider
        clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID || ''}
      >
        <ReduxProvider store={store}>
          <GeneralContextProvider>
            {children}
            <Toaster />
          </GeneralContextProvider>
        </ReduxProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
};
