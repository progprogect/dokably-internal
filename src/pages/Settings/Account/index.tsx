import React, { useState } from 'react';
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Input from '@shared/common/input';
import Button from '@shared/common/Button';
import Modal from '@shared/common/Modal';

import { selectCurrentUser, logout } from '@app/redux/features/userSlice';
import {
  useChangeEmailMutation,
  useChangePasswordMutation,
  useDeleteUserMutation,
  useModifyCredentialsMutation,
  useRevokeAccessTokensMutation,
  useUpdateUserMutation,
} from '@app/redux/api/userApi';
import { useApplyNewEmailMutation } from '@app/redux/api/authApi';
import ChangeEmailSuccess from './ChangeEmailSuccess';
import { getUserInfo } from '@app/services/user.service';
import { IUser } from '@entities/models/IUser';
import { track } from '@amplitude/analytics-browser';

const accountSettingsSchema = object({
  email: string()
    .min(1, 'Email address is required')
    .email('Email Address is invalid'),
  username: string().min(1, 'Username is required'),
  newPassword: string()
    .min(1, 'Password is required')
    .min(8, 'Password is to short'),
  currentPassword: string().min(1, 'Current password is required'),
  currentPassword2: string().min(1, 'Current password is required'),
});

type AccountSettingsInput = TypeOf<typeof accountSettingsSchema>;

const AccountSettings = () => {
  const [showChangeUsername, setShowChangeUsername] = React.useState(false);
  const [showChangeEmail, setShowChangeEmail] = React.useState(false);
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [deleteIsOpen, setDeleteIsOpen] = React.useState(false);
  const [checkEmailIsOpen, setCheckEmailIsOpen] = React.useState(false);
  const [emailSuccessIsOpen, setEmailSuccessIsOpen] = React.useState(false);

  const [updateUser, { isLoading: isUpdateName }] = useUpdateUserMutation();
  const [
    modifyCredentials,
    {
      isLoading: isModifyCredentials,
      isSuccess: isisModifyCredentialsSuccess,
      data,
    },
  ] = useModifyCredentialsMutation();
  const [
    changePassword,
    { isLoading: isChangePassword, isSuccess: isChangePasswordSuccess },
  ] = useChangePasswordMutation();
  const [
    changeEmail,
    { isLoading: isChangeEmail, isSuccess: isChangeEmailSuccess },
  ] = useChangeEmailMutation();
  const [deleteUser, { isLoading: isDeleteUser, isSuccess: isDeleteSuccess }] =
    useDeleteUserMutation();
  const [applyNewEmail, { isSuccess: isSuccessApplyNewEmail }] =
    useApplyNewEmailMutation();
  const [revokeAccessTokens] = useRevokeAccessTokensMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector(selectCurrentUser);
  const [userInfo, setUserInfo] = useState<IUser>();

  React.useEffect(() => {
    getUserInfo().then((userInfo) => {
      setUserInfo(userInfo);
    });
  }, []);

  React.useEffect(() => {
    if (isSuccessApplyNewEmail) {
      setEmailSuccessIsOpen(true);
    }
  }, [isSuccessApplyNewEmail]);

  React.useEffect(() => {
    const id = searchParams.get('id') || '';
    const signature = searchParams.get('signature') || '';
    const expires = searchParams.get('expires') || '';
    const verification_id = searchParams.get('verification_id') || '';

    if (id && signature && expires && verification_id && user.isLoggedIn) {
      const params = new URLSearchParams({
        signature,
        expires,
        verification_id,
      }).toString();

      applyNewEmail({ id, params });
      setSearchParams('');
    }
  }, [user]);

  React.useEffect(() => {
    if (isChangeEmailSuccess) {
      setCheckEmailIsOpen(true);
    }
  }, [isChangeEmailSuccess]);

  React.useEffect(() => {
    if (isDeleteSuccess) {
      setDeleteIsOpen(false);
      dispatch(logout());
      navigate('/login');
    }
  }, [isDeleteSuccess]);

  React.useEffect(() => {
    if (isisModifyCredentialsSuccess) {
      const params = new URLSearchParams({
        signature: data?.signature || '',
        expires: data?.expires || '',
      }).toString();

      if (showChangePassword) {
        changePassword({
          id: data?.id || '',
          password: methods.getValues('newPassword'),
          params,
        })
          .unwrap()
          .catch((error) => {
            methods.setError('newPassword', {
              type: 'Invalid credentials',
              message:
                error.data.message || 'An error occured. Please, try again.',
            });
          });
      } else if (showChangeEmail) {
        changeEmail({
          id: data?.id || '',
          email: methods.getValues('email'),
          params,
        })
          .unwrap()
          .catch((error) => {
            methods.setError('email', {
              type: 'Invalid credentials',
              message:
                error?.data?.items?.[0]?.message ||
                'An error occured. Please, try again.',
            });
          });
      }
    }
  }, [isisModifyCredentialsSuccess, data]);

  React.useEffect(() => {
    if (isChangePasswordSuccess) {
      setShowChangePassword(false);
      methods.resetField('currentPassword2');
      methods.resetField('newPassword');
    }
  }, [isChangePasswordSuccess]);

  const methods = useForm<AccountSettingsInput>({
    resolver: zodResolver(accountSettingsSchema),
  });

  const watchUsername = methods.watch('username');

  React.useEffect(() => {
    if (userInfo?.name) {
      methods.setValue('username', userInfo?.name);
    }

    if (userInfo?.email) {
      methods.setValue('email', userInfo?.email);
    }
  }, [userInfo]);

  React.useEffect(() => {
    if (methods.formState.dirtyFields.username && !showChangeUsername) {
      setShowChangeUsername(true);
    }
  }, [watchUsername]);

  const onCancelChangeUsername = () => {
    setShowChangeUsername(false);
    methods.resetField('username');
    methods.setValue('username', userInfo?.name || '');
  };

  const handleChangeName = async () => {
    const valid = await methods.trigger('username');

    if (valid) {
      updateUser({
        name: methods.getValues('username'),
        id: userInfo?.id || '',
      })
        .unwrap()
        .then(() => setShowChangeUsername(false))
        .catch((error) => {
          methods.setError('username', {
            type: 'Invalid credentials',
            message:
              error.data.message || 'An error occured. Please, try again.',
          });
        });
    }
  };

  const handleChangePassword = async () => {
    const valid = await methods.trigger(['currentPassword2', 'newPassword']);

    if (valid) {
      modifyCredentials({
        type: 'password',
        password: methods.getValues('currentPassword2'),
        id: userInfo?.id || '',
      })
        .unwrap()
        .catch((error) => {
          methods.setError('currentPassword2', {
            type: 'Invalid credentials',
            message:
              error.data.message || 'An error occured. Please, try again.',
          });
        });
    }
  };

  const handleDeleteAccount = () => {
    track('my_settings_delete_account_confirmed');
    deleteUser({ id: userInfo?.id || '' });
  };

  const handleChangeEmail = async () => {
    const valid = await methods.trigger(['currentPassword', 'email']);

    if (valid) {
      modifyCredentials({
        type: 'email',
        password: methods.getValues('currentPassword'),
        id: userInfo?.id || '',
      })
        .unwrap()
        .catch((error) => {
          methods.setError('currentPassword', {
            type: 'Invalid credentials',
            message:
              error.data.message || 'An error occured. Please, try again.',
          });
        });
    }
  };

  const onLogout = async () => {
    track('my_settings_log_out_action');
    await revokeAccessTokens({});
    dispatch(logout());
    navigate('/login');
  };

  return (
    <FormProvider {...methods}>
      <ChangeEmailSuccess
        modalIsOpen={emailSuccessIsOpen}
        onClose={() => setEmailSuccessIsOpen(false)}
      />
      <Modal
        modalIsOpen={checkEmailIsOpen}
        closeModal={() => setCheckEmailIsOpen(false)}
      >
        <div className='text-20-16 font-medium text-text90'>
          Check your email
        </div>
        <div className='w-96 mt-5 text-base text-text70'>
          We’ve just sent a verification link to ‘{methods.getValues('email')}’
        </div>
        <div className='w-full flex mt-14 justify-end'>
          <Button
            label='Ok'
            styleType='small-gray'
            onClick={() => setCheckEmailIsOpen(false)}
          />
        </div>
      </Modal>
      <Modal
        modalIsOpen={deleteIsOpen}
        closeModal={() => setDeleteIsOpen(false)}
        closeButton={false}
      >
        <div className='text-20-16 font-medium text-text90'>
          Delete account
        </div>
        <div className='w-96 mt-5 text-base text-text70'>
          This action cannot be undone. This will permanently delete your entire
          account. All private workspaces will be deleted, and you will be
          removed from all shared workspaces.
        </div>
        <div className='flex mt-14 items-center'>
          <Button
            label='Cancel'
            styleType='small-gray'
            onClick={() => { track('my_settings_delete_account_closed'); setDeleteIsOpen(false); }}
            className='w-full mr-3'
          />
          <Button
            label='Delete account'
            className='!text-errorText w-full'
            styleType='small-gray'
            onClick={handleDeleteAccount}
            isLoading={isDeleteUser}
            disabled={isDeleteUser}
          />
        </div>
      </Modal>
      <div className='text-2xl3 text-text90'>My settings</div>
      <div className='font-medium text-lg3 text-text90 mt-12.5'>Profile</div>
      <div className='font-medium text-sm text-text50 mt-7'>User name</div>
      <div className='mt-2 flex items-center'>
        <div className='w-65 mr-3'>
          <Input name='username' type='text' errorClassName='absolute' />
        </div>
        {showChangeUsername && (
          <>
            <Button
              label='Cancel'
              className='mr-2'
              styleType='small-gray'
              onClick={onCancelChangeUsername}
            />
            <Button
              label='Change'
              styleType='small-primary'
              onClick={handleChangeName}
              disabled={isUpdateName}
              isLoading={isUpdateName}
            />
          </>
        )}
      </div>
      <div className='mt-6 flex items-end'>
        <div className='w-65 mr-3'>
          <div className='font-medium text-sm text-text50'>
            {showChangeEmail ? 'Enter new email' : 'Email'}
          </div>
          <div className='mt-2 w-full'>
            <Input
              name='email'
              type='text'
              errorClassName='absolute'
              disabled={!showChangeEmail}
            />
          </div>
        </div>
        {!showChangeEmail && (
          <div className='flex h-10 items-center'>
            <Button
              label='Change email'
              styleType='small-gray'
              onClick={() => setShowChangeEmail(true)}
            />
          </div>
        )}
        {showChangeEmail && (
          <>
            <div className='w-65 mr-3'>
              <div className='font-medium text-sm text-text50'>
                Enter current password
              </div>
              <div className='mt-2 w-full'>
                <Input
                  name='currentPassword'
                  type='password'
                  errorClassName='absolute'
                />
              </div>
            </div>
            <div className='flex h-10 items-center'>
              <Button
                label='Cancel'
                className='mr-2'
                styleType='small-gray'
                onClick={() => {
                  setShowChangeEmail(false);
                  methods.resetField('currentPassword');
                  methods.resetField('email');
                  if (userInfo?.email) {
                    methods.setValue('email', userInfo?.email);
                  }
                }}
              />
              <Button
                label='Change'
                styleType='small-primary'
                onClick={handleChangeEmail}
                disabled={isModifyCredentials || isChangeEmail}
                isLoading={isModifyCredentials || isChangeEmail}
              />
            </div>
          </>
        )}
      </div>
      <div className='mt-7.5 h-px bg-text10'></div>
      <div className='font-medium text-lg3 text-text90 mt-7.5'>Password</div>
      <div className='mt-6 flex items-end'>
        {!showChangePassword && (
          <div className='flex h-10 items-center'>
            <Button
              style={{ width: '153px' }}
              label='Change password'
              styleType='small-gray'
              onClick={() => setShowChangePassword(true)}
            />
          </div>
        )}
        {showChangePassword && (
          <>
            <div className='w-65 mr-3'>
              <div className='font-medium text-sm text-text50'>
                Current password
              </div>
              <div className='mt-2 w-full'>
                <Input
                  name='currentPassword2'
                  type='password'
                  errorClassName='absolute'
                />
              </div>
            </div>
            <div className='w-65 mr-3'>
              <div className='font-medium text-sm text-text50'>
                New password
              </div>
              <div className='mt-2 w-full'>
                <Input
                  name='newPassword'
                  type='password'
                  errorClassName='absolute'
                />
              </div>
            </div>
            <div className='flex h-10 items-center'>
              <Button
                label='Cancel'
                className='mr-2'
                styleType='small-gray'
                onClick={() => {
                  setShowChangePassword(false);
                  methods.resetField('currentPassword2');
                  methods.resetField('newPassword');
                }}
              />
              <Button
                label='Change'
                styleType='small-primary'
                disabled={isModifyCredentials || isChangePassword}
                isLoading={isModifyCredentials || isChangePassword}
                onClick={handleChangePassword}
              />
            </div>
          </>
        )}
      </div>
      <div className='mt-7.5 h-px bg-text10'></div>
      <div className='font-medium text-lg3 text-text90 mt-7.5'>Log out</div>
      <div className='font-normal text-sm text-text50 mt-4'>
        You will be logged out of all active sessions. To get inside the app,
        you will have to log back in.
      </div>
      <Button
        label='Log out'
        className='!text-errorText mt-5'
        styleType='small-gray'
        onClick={onLogout}
      />
      <div className='mt-7.5 h-px bg-text10'></div>
      <div className='font-medium text-lg3 text-text90 mt-7.5'>
        Account deletion
      </div>
      <div className='font-normal text-sm text-text50 mt-4 w-[620px] leading-[20px]'>
        This action cannot be undone. This will permanently delete your entire
        account. All private
        workspaces will be deleted, and you will be removed from all shared
        workspaces.
      </div>
      <Button
        label='Delete account'
        className='!text-errorText mt-5 mb-15'
        styleType='small-gray'
        onClick={() => { track('my_settings_delete_account_action'); setDeleteIsOpen(true); }}
      />
    </FormProvider>
  );
};

export default AccountSettings;
