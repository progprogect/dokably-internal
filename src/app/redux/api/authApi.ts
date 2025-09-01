import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { userApi } from './userApi';
import { SingUpInput } from '@pages/SignUp';
import { EmailVerificationInput } from '@pages/EmailVerification';
import { LoginInput } from '@pages/Login/Login.types';
export interface AuthResponse {
  refreshToken: string;
  token: string;
}

export interface NetworkRequest {
  accessToken: string;
  type: string;
}

export interface SecurityRespone {
  id: string;
  signature: string;
  expires: string;
}

const baseUrl = `${process.env.REACT_APP_SERVER_ENDPOINT}/api/`;

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');

      return headers;
    },
  }),
  endpoints: (builder) => ({
    verifyCode: builder.mutation<SecurityRespone, EmailVerificationInput>({
      query(data) {
        return {
          url: 'frontend/auth/verify-code',
          method: 'POST',
          body: data,
        };
      },
      async onQueryStarted(args, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data.id) {
            await localStorage.setItem('verify-code', JSON.stringify(data));
          }
        } catch (error) {}
      },
    }),
    verifyEmail: builder.mutation<null, SingUpInput>({
      query(data) {
        return {
          url: 'frontend/auth/verify-email',
          method: 'POST',
          body: data,
        };
      },
      async onQueryStarted(args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await localStorage.setItem('verify-email', args.email);
        } catch (error) {}
      },
    }),
    login: builder.mutation<AuthResponse, LoginInput>({
      query: (data) => ({
        url: 'frontend/auth/sign-in',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data.token) {
            await localStorage.setItem('tokens', JSON.stringify(data));
            await dispatch(
              userApi.endpoints.getMe.initiate(null, { forceRefetch: true }),
            );
          }
        } catch (error) {}
      },
    }),
    guestLogin: builder.mutation<AuthResponse, { hash: string }>({
      query: (data) => ({
        url: 'frontend/auth/sign-in',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('data: ', data)

          if (data.token) {
            await localStorage.setItem('tokens', JSON.stringify(data));
            await dispatch(
              userApi.endpoints.getMe.initiate(null, { forceRefetch: true }),
            );
          }
        } catch (error) {
          throw error;
        }
      },
    }),
    registration: builder.mutation<
      { email: string },
      { password: string; id: string; params: string }
    >({
      query: ({ id, params, ...data }) => ({
        url: 'frontend/auth/sign-up/' + id + '?' + params,
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data.email) {
            await dispatch(
              authApi.endpoints.login.initiate({
                email: data.email,
                password: args.password,
              }),
            );
          }
        } catch (error) {}
      },
    }),
    loginNetwork: builder.mutation<AuthResponse, NetworkRequest>({
      query: (data) => ({
        url: 'frontend/auth/sign-in/network',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data.token) {
            await localStorage.setItem('tokens', JSON.stringify(data));
            await dispatch(
              userApi.endpoints.getMe.initiate(null, { forceRefetch: true }),
            );
          }
        } catch (error) {}
      },
    }),
    registrationNetwork: builder.mutation<AuthResponse, NetworkRequest>({
      query: (data) => ({
        url: 'frontend/auth/sign-up/network',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data.token) {
            await localStorage.setItem('tokens', JSON.stringify(data));
            await dispatch(
              userApi.endpoints.getMe.initiate(null, { forceRefetch: true }),
            );
          }
        } catch (error) {}
      },
    }),
    resetPassword: builder.mutation<null, { email: string }>({
      query: (data) => ({
        url: 'frontend/auth/reset-password-email',
        method: 'POST',
        body: data,
      }),
    }),
    updatePassword: builder.mutation<
      null,
      { password: string; id: string; params: string }
    >({
      query: ({ id, params, ...data }) => ({
        url: 'frontend/auth/reset-password/' + id + '?' + params,
        method: 'POST',
        body: data,
      }),
    }),
    applyNewEmail: builder.mutation<
      AuthResponse,
      { id: string; params: string }
    >({
      query: ({ id, params }) => ({
        url: 'frontend/auth/user/' + id + '/apply-new-email?' + params,
        method: 'POST',
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data.token) {
            await localStorage.setItem('tokens', JSON.stringify(data));
            await dispatch(userApi.util.invalidateTags(['User']));
          }
        } catch (error) {}
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLoginNetworkMutation,
  useVerifyEmailMutation,
  useVerifyCodeMutation,
  useRegistrationNetworkMutation,
  useRegistrationMutation,
  useGuestLoginMutation,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
  useApplyNewEmailMutation,
} = authApi;
