import { createApi } from '@reduxjs/toolkit/query/react';

import { setUser } from '@app/redux/features/userSlice';
import { SecurityRespone } from './authApi';
import { IQuestionnaire } from './types';
import customFetchBase from './customFetchBase';
import { IUser } from '@entities/models/IUser';

enum CredentialsType {
  email,
  password,
}

type CredentialsTypeStrings = keyof typeof CredentialsType;

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: customFetchBase,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getMe: builder.query<IUser, null>({
      query: () => ({
        url: 'user/info',
      }),
      providesTags: ['User'],
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data.id) {
            dispatch(setUser(data));
          }
        } catch (error) {}
      },
    }),
    questionnaire: builder.mutation<IQuestionnaire, IQuestionnaire>({
      query({ id, ...data }) {
        return {
          url: `user/${id}/questionnaire`,
          method: 'POST',
          body: data,
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          await dispatch(
            userApi.endpoints.getMe.initiate(null, { forceRefetch: true }),
          );
        } catch (error) {}
      },
    }),
    updateUser: builder.mutation<IUser, { name: string; id: string }>({
      query({ id, ...data }) {
        return {
          url: 'user/' + id,
          method: 'PATCH',
          body: data,
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data.id) {
            dispatch(setUser(data));
          }
        } catch (error) {}
      },
    }),
    changePassword: builder.mutation<
      null,
      { password: string; params: string; id: string }
    >({
      query({ id, params, ...data }) {
        return {
          url: 'user/' + id + '/change-password?' + params,
          method: 'POST',
          body: data,
        };
      },
    }),
    changeEmail: builder.mutation<
      null,
      { email: string; params: string; id: string }
    >({
      query({ id, params, ...data }) {
        return {
          url: 'user/' + id + '/change-email?' + params,
          method: 'POST',
          body: data,
        };
      },
    }),
    modifyCredentials: builder.mutation<
      SecurityRespone,
      { password: string; type: CredentialsTypeStrings; id: string }
    >({
      query({ id, ...data }) {
        return {
          url: 'user/' + id + '/modify-credentials-access',
          method: 'POST',
          body: data,
        };
      },
    }),
    deleteUser: builder.mutation<null, { id: string }>({
      query({ id }) {
        return {
          url: 'user/' + id,
          method: 'DELETE',
        };
      },
    }),
    revokeAccessTokens: builder.mutation<null, object>({
      query() {
        return {
          url: 'user/revoke-access-tokens',
          method: 'POST',
        };
      },
    }),
  }),
});

export const {
  useQuestionnaireMutation,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useModifyCredentialsMutation,
  useDeleteUserMutation,
  useChangeEmailMutation,
  useGetMeQuery,
  useRevokeAccessTokensMutation,
} = userApi;
