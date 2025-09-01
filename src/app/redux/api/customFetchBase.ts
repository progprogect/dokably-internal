import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';

import { logout } from '@app/redux/features/userSlice';

const baseUrl = `${process.env.REACT_APP_SERVER_ENDPOINT}/api/frontend/`;

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');

    if (tokens.token) {
      headers.set('Authorization', `Bearer ${tokens.token}`);
    }

    return headers;
  },
});

const customFetchBase: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // wait until the mutex is available without locking it
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);
  if (Object(result.error)?.originalStatus === 500) {
    //window.location.href = '/500';
  }
  if ((result.error?.data as any)?.message === 'Expired JWT Token') {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');

        const refreshResult = await baseQuery(
          {
            url: 'auth/refresh-token',
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: {
              refresh_token: tokens.refresh_token,
            },
          },
          api,
          extraOptions
        );

        if (Object(refreshResult.error)?.originalStatus === 500) {
          //window.location.href = '/500';
        }

        if (refreshResult.data) {
          // Retry the initial query
          await localStorage.setItem(
            'tokens',
            JSON.stringify(refreshResult.data)
          );
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
        }
      } finally {
        // release must be called once the mutex should be released again.
        release();
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export default customFetchBase;
