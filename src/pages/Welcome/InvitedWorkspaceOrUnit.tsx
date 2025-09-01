import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import cn from 'classnames';

import Input from '@shared/common/input';
import Button from '@shared/common/Button';

import { selectCurrentUser } from '@app/redux/features/userSlice';
import { useRegistrationMutation } from '@app/redux/api/authApi';
import { track } from '@amplitude/analytics-browser';
import { WelcomeInvitedInput, welcomeInvitedSchema } from './Welcome.types';

const PasswordComponent = ({ name, methods }: any) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    track('onboarding_password_start');
  }, []);

  return (
    <div className='animate__animated animate__fadeIn'>
      <div
        className='font-medium text-2xl2 mt-10'
        style={{ overflowWrap: 'anywhere' }}
      >
        Let’s get started, ‘{name}’ 🎊
      </div>
      <div className='mt-4 mb-10 text-text60 text-sml'>Please, set a password to log in with.</div>
      <Input
        id='password'
        key='password'
        name='password'
        type='password'
        placeholder='Minimum 8 characters'
      />
      <div
        className='w-full flex justify-end items-center'
        style={{ marginTop: '94px' }}
      >
        <Button
          styleType='small-black'
          label='Next'
          isLoading={isLoading}
          onClick={async () => {
            const valid = await methods.trigger('password');

            if (valid) {
              setIsLoading(true);
              track('onboarding_password_completed');
            }
          }}
        />
      </div>
    </div>
  );
};

const InvitedWorkspaceOrUnit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const [registration] = useRegistrationMutation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const name = useMemo(() => {
    return localStorage.getItem('verify-email') || 'Guest';
  }, []);

  const [searchParams] = useSearchParams();

  const methods = useForm<WelcomeInvitedInput>({
    resolver: zodResolver(welcomeInvitedSchema),
  });

  useEffect(() => {
    if (
      !localStorage.getItem('tokens') &&
      !localStorage.getItem('verify-code') &&
      !(searchParams.get('id') && searchParams.get('signature') && searchParams.get('expires'))
    ) {
      navigate('/login');
    }

    if (searchParams.get('id') && searchParams.get('signature') && searchParams.get('expires')) {
      track('onboarding_link_opened');
    }
    track('onboarding_started');
  }, []);

  useEffect(() => {
    if (user.isLoggedIn) {
      const params = new URLSearchParams(location.search);
      const returnURL = params.get('returnURL');
      const url = returnURL ? returnURL : '/home';

      navigate(url);
    }
  }, [user]);

  useEffect(() => {
    if (shouldRedirect && user.isLoggedIn) {
      const params = new URLSearchParams(location.search);
      const returnURL = params.get('returnURL');
      const url = returnURL ? returnURL : '/workspaces';

      navigate(url);
    }
  }, [shouldRedirect, user.isLoggedIn]);

  useEffect(() => {
    setTimeout(() => {
      methods.clearErrors();
    });
  }, []);

  const onSubmitHandler: SubmitHandler<WelcomeInvitedInput> = (values) => {
    const data = JSON.parse(localStorage.getItem('verify-code') || '{}');
    if (searchParams.get('id') && searchParams.get('signature') && searchParams.get('expires')) {
      data.id = searchParams.get('id');
      data.signature = searchParams.get('signature');
      data.expires = searchParams.get('expires');
    }
    const params = new URLSearchParams({
      signature: data.signature,
      expires: data.expires,
    }).toString();

    if (data.id && data.signature && data.expires) {
      registration({ ...values, id: data.id, params })
        .unwrap()
        .then(() => {
          track('onboarding_completed');
          setShouldRedirect(true);
        })
        .catch((error) => {
          methods.setError('password', {
            type: 'Invalid credentials',
            message: error?.data?.message || 'An error occured. Please, try again.',
          });
        });
    }
  };

  const [isCompact, setCompact] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    checkWidth();
  }, []);

  const checkWidth = () => {
    const isSmallWindowCompact = window.innerWidth < 400;
    const isCompact = window.innerWidth <= 728;
    setCompact(isCompact);
    setWidth(isSmallWindowCompact ? 300 : 400);
  };

  useEffect(() => {
    window.addEventListener('resize', checkWidth, false);
    return () => {
      window.removeEventListener('resize', checkWidth);
    };
  }, []);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmitHandler)}>
        <div
          className={cn('mt-58.5 mx-[5px]', { 'mt-[80px]': isCompact })}
          style={{ width: `${width}px` }}
        >
          <PasswordComponent
            name={name}
            methods={methods}
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default InvitedWorkspaceOrUnit;
