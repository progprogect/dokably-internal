import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { useGoogleLogin, TokenResponse } from '@react-oauth/google';

import { useSelector } from 'react-redux';

import {
  useLoginMutation,
  useLoginNetworkMutation,
} from '@app/redux/api/authApi';
import { selectCurrentUser } from '@app/redux/features/userSlice';

import Input from '@shared/common/input';
import Button from '@shared/common/Button';

import { track } from '@amplitude/analytics-browser';
import { LoginInput, loginSchema } from './Login.types';

import { ReactComponent as GoogleIcon } from '@images/google.svg';
import { ReactComponent as CheckIcon } from '@images/check.svg';

import cn from 'classnames';
import cssStyles from './style.module.scss';

const Login = () => {
  const [remember, setRemember] = React.useState<boolean>(false);
  const [serverError, setServerError] = React.useState<string>('');
  const [isUserLoading, setIsUserLoading] = React.useState(false);

  const [login, { isLoading: isLoadingByCredentials }] = useLoginMutation();
  const [loginNetwork, { isLoading: isLoadingByNetwork }] = useLoginNetworkMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);

  const methods = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user.isLoggedIn) {
      const params = new URLSearchParams(location.search);
      const returnURL = params.get('returnURL');

      if (!returnURL || returnURL === '/' || returnURL === '/home') {
        return navigate('/workspaces');
      }

      return navigate(returnURL);
    }
  }, [user]);

  useEffect(() => {
    const rememberMe = JSON.parse(
      localStorage.getItem('rememberme') || 'false',
    );

    setRemember(rememberMe);

    if (localStorage.getItem('tokens')) {
      const params = new URLSearchParams(location.search);
      const returnURL = params.get('returnURL');
      const url = returnURL ? returnURL : '/workspaces';

      navigate(url);
    }

    track('login_opened');
  }, []);

  const responseGoogle = (response: TokenResponse) => {
    if (response.access_token) {
      setServerError('');
      setIsUserLoading(true);

      loginNetwork({ accessToken: response.access_token, type: 'google' })
        .unwrap()
        .then(() => {
          track('login_completed');
        })
        .catch((error) => {
          setIsUserLoading(false);
          track('login_failed', {
            source: 'google',
            reason: error.data.message || error.data?.code,
          });
          if (error.data?.code === 401) {
            setServerError(error.data.message);
          } else {
            setServerError('An error occured. Please, try to log in again.');
          }
        });
    }
  };

  const handleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => responseGoogle(tokenResponse),
  });

  const onSubmitHandler: SubmitHandler<LoginInput> = (values) => {
    track('login_started', {
      source: 'password',
      remember: remember,
    });
    setServerError('');
    setIsUserLoading(true);

    login(values)
      .unwrap()
      .then(() => {
        track('login_completed');
      })
      .catch((error: any) => {
        setIsUserLoading(false);
        track('login_failed', {
          source: 'password',
          reason: error.data.message || error.data?.code,
        });
        if (error.data?.code === 401) {
          setServerError(error.data.message);
        } else {
          setServerError('An error occured. Please, try to log in again.');
        }
      });
  };

  const handleChangeRemember = () => {
    localStorage.setItem('rememberme', JSON.stringify(!remember));
    setRemember(!remember);
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

  const goSigUp = () => {
    const url = location.search ? `/sign-up${location.search}` : '/sign-up';

    return (
      <Link
        to={url}
        onClick={() => track('signup_clicked')}
      >
        Sign up
      </Link>
    );
  };

  const goToResetPasswordPage = () => {
    const url = location.search
      ? `/forgot-password${location.search}`
      : '/forgot-password';

    navigate(url);
  };

  return (
    <>
      <FormProvider {...methods}>
        <form
          className={cssStyles.form}
          onSubmit={methods.handleSubmit(onSubmitHandler)}
        >
          <div className={cssStyles.title}>Log in to Dokably</div>
          <Button
            className={cssStyles.googleButton}
            onClick={() => {
              track('login_started', {
                source: 'google',
                remember: remember,
              });
              handleLogin();
            }}
            type='button'
            label='Continue with Google'
            styleType='network'
            icon={<GoogleIcon className={cssStyles.googleIcon} />}
          />
          <div className={cssStyles.or}>or</div>
          <Input
            name='email'
            type='email'
            placeholder='Email'
            autoComplete='on'
          />
          <div className={cssStyles.passwordInputWrapper}>
            <Input
              name='password'
              type='password'
              placeholder='Password'
              autoComplete='on'
            />
          </div>

          <div className={cssStyles.actionsWrapper}>
            <label className={cssStyles.rememberWrapper}>
              <input
                className={cssStyles.rememberShadowCheckbox}
                type='checkbox'
                checked={remember}
                onChange={handleChangeRemember}
              />
              <div
                className={cn(cssStyles.rememberCheckboxWrapper, {
                  [cssStyles.rememberCheckboxWrapperIsRemember]: remember,
                })}
              >
                <CheckIcon className={cssStyles.rememberCheckboxIcon} />
              </div>
              <span className={cssStyles.rememberTitle}>Remember me</span>
            </label>
            <div
              className={cssStyles.forgotPassword}
              onClick={goToResetPasswordPage}
            >
              Forgot password?
            </div>
          </div>

          <Button
            className={cssStyles.loginButton}
            type='submit'
            disabled={
              isLoadingByCredentials || isLoadingByNetwork || isUserLoading
            }
            isLoading={
              isLoadingByCredentials || isLoadingByNetwork || isUserLoading
            }
            label='Log in'
            styleType='primary'
          />
          {serverError && (
            <div className={cssStyles.errorMessage}>{serverError}</div>
          )}
        </form>
      </FormProvider>
      <div className={cssStyles.noAccountWrapper}>
        <div>No account?&nbsp;</div>
        <div className={cssStyles.noAccountLinkWrapper}>{goSigUp()}</div>
      </div>
    </>
  );
};

export default Login;
