import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { useGoogleLogin, TokenResponse } from '@react-oauth/google';
import { useSelector } from 'react-redux';

import { useVerifyEmailMutation, useRegistrationNetworkMutation } from '@app/redux/api/authApi';
import { selectCurrentUser } from '@app/redux/features/userSlice';

import Input from '@shared/common/input';
import Button from '@shared/common/Button';
import { ReactComponent as Google } from '@images/google.svg';
import { track } from '@amplitude/analytics-browser';

const SingUpSchema = object({
  email: string().min(1, 'Email address is required').email('Email Address is invalid'),
});

export type SingUpInput = TypeOf<typeof SingUpSchema>;

const SingUpPage = () => {
  const [serverError, setServerError] = React.useState<string>('');
  const [isUserLoading, setIsUserLoading] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);

  const methods = useForm<SingUpInput>({
    resolver: zodResolver(SingUpSchema),
  });

  const [verifyEmail, { isLoading: isLoadingByCredentials, isSuccess }] = useVerifyEmailMutation();
  const [registrationNetwork, { isLoading: isLoadingByNetwork }] = useRegistrationNetworkMutation();

  React.useEffect(() => {
    if (isSuccess) {
      const url = location.search ? `/email-verification${location.search}` : '/email-verification';

      navigate(url);
      setIsUserLoading(false);
    }
  }, [isSuccess, navigate]);

  const responseGoogle = (response: TokenResponse) => {
    if (response.access_token) {
      setIsUserLoading(true);

      registrationNetwork({
        accessToken: response.access_token,
        type: 'google',
      })
        .unwrap()
        .then(() => {
          track('signup_completed', { source: 'google' });
          const params = new URLSearchParams(location.search);
          const returnURL = params.get('returnURL');
          const url = returnURL ? returnURL : '/home';
          navigate(url);
        })
        .catch((error) => {
          setIsUserLoading(false);
          track('signup_failed', {
            source: 'google',
            reason: error.data.message || error.status || 'An error occured. Please, try to sign up again.',
          });
          if (error.status === 400) {
            methods.setError('email', {
              type: 'Invalid credentials',
              message: error.data.message,
            });
          } else {
            methods.setError('email', {
              type: 'Invalid credentials',
              message: 'An error occured. Please, try to sign up again.',
            });
          }
        });
    }
  };

  const handleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => responseGoogle(tokenResponse),
  });

  const onSubmitHandler: SubmitHandler<SingUpInput> = (values) => {
    track('signup_started', { source: 'password' });
    setServerError('');

    verifyEmail(values)
      .unwrap()
      .then(() => {
        track('signup_completed', { source: 'password' });
      })
      .catch((error) => {
        track('signup_failed', {
          source: 'password',
          reason:
            error.data.items[0].message ||
            error.data.items[0].message ||
            error.status ||
            'An error occured. Please, try to sign up again.',
        });
        if (error.status === 422) {
          methods.setError('email', {
            type: 'Invalid credentials',
            message: error.data.items[0].message,
          });
        } else {
          setServerError(error?.data?.items?.[0]?.message || 'An error occured. Please, try to sign up again.');
        }
      });
  };

  useEffect(() => {
    document.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();

        const onSubmit = methods.handleSubmit(onSubmitHandler);
        onSubmit();
      }
    });
  }, []);

  const goToLogin = () => {
    const url = location.search ? `/login${location.search}` : '/login';

    return <Link to={url}>Login</Link>;
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmitHandler)}>
          <div className='text-center font-medium text-2xl'>Create your free account</div>
          <Button
            type='button'
            className='mt-7.5'
            onClick={() => {
              track('signup_started', { source: 'google' });
              handleLogin();
            }}
            label='Continue with Google'
            styleType='network'
            icon={<Google className='mr-2' />}
          />
          <div className='text-center text-text50 text-sm mt-5'>or</div>
          <div className='mt-7.5'>
            <Input
              name='email'
              type='email'
              placeholder='Your work email'
            />
          </div>
          <Button
            className='mt-4'
            type='submit'
            disabled={isLoadingByCredentials || isLoadingByNetwork || isUserLoading}
            isLoading={isLoadingByCredentials || isLoadingByNetwork || isUserLoading}
            label='Continue with email'
            styleType='primary'
          />
          {serverError && <div className='mt-1.5 text-errorText text-xs'>{serverError}</div>}
        </form>
      </FormProvider>
      <div className='flex items-center self-center pt-12.5 text-text60 text-sml'>
        <div>Have an account?&nbsp;</div>
        <div className='underline cursor-pointer hover:text-text90'>{goToLogin()}</div>
      </div>
    </>
  );
};

export default SingUpPage;
