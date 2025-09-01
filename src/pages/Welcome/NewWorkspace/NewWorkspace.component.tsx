import React, { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { track } from '@amplitude/analytics-browser';
import { useSelector } from 'react-redux';
import cn from 'classnames';

import { useQuestionnaireMutation } from '@app/redux/api/userApi';
import { useRegistrationMutation } from '@app/redux/api/authApi';
import { selectCurrentUser } from '@app/redux/features/userSlice';
import Input from '@shared/common/input';
import Button from '@shared/common/Button';

import { WelcomeInput, welcomeSchema, welcomeSchemaWithoutPassword } from '../Welcome.types';

const STEPS = {
  password: 0,
  welcome: 1,
};

const PasswordComponent = ({ name, methods, setStep }: any) => {
  useEffect(() => {
    track('onboarding_password_start');
  }, []);

  return (
    <div className='animate__animated animate__fadeIn'>
      <div className='flex justify-between'>
        <div className='h-0.75 w-full bg-primary'></div>
        <div className='h-0.75 w-full ml-2 bg-text opacity-10'></div>
      </div>
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
          onClick={async () => {
            const valid = await methods.trigger('password');

            if (valid) {
              track('onboarding_password_completed');
              setStep(STEPS.welcome);
            }
          }}
        />
      </div>
    </div>
  );
};

const WelcomeComponent = ({ methods, setStep, submitType, setSubmitType }: any) => {
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    track('onboarding_company_start');
  }, []);

  return (
    <div className='animate__animated animate__fadeIn'>
      <div className='flex justify-between'>
        <div className='h-0.75 w-full bg-primary'></div>
        <div className='h-0.75 w-full ml-2 bg-primary'></div>
      </div>
      <div className='font-medium text-2xl2 mt-10'>What is the name of your company or team?</div>
      <div className='mt-4 mb-10 text-text60 text-sml'>This will be the name of your Dokably workspace.</div>
      <Input
        id='companyName'
        key='companyName'
        name='companyName'
        type='text'
        placeholder='Set a name for your workspace'
      />
      <div
        className={cn('w-full flex mt-15 items-center', {
          'justify-between': !user.isLoggedIn,
          'justify-end': user.isLoggedIn,
        })}
      >
        {!user.isLoggedIn && (
          <Button
            styleType='small-white'
            label='Back'
            onClick={() => {
              track('onboarding_company_back_clicked');
              setStep(STEPS.password);
            }}
          />
        )}
        <Button
          styleType='small-black'
          label='Next'
          type='submit'
          isLoading={submitType === 'next'}
          onClick={async () => {
            const valid = await methods.trigger('companyName');

            if (valid) {
              setSubmitType('next');
              track('onboarding_company_completed');
            }
          }}
        />
      </div>
    </div>
  );
};

const NewWorkspace = () => {
  const [submitType, setSubmitType] = useState();
  const [step, setStep] = useState(STEPS.password);
  const [usePlatformFor] = useState('individual');

  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const [questionnaire] = useQuestionnaireMutation();
  const [registration, { isSuccess: isRegistrationSuccess }] = useRegistrationMutation();

  const name = useMemo(() => {
    const email = localStorage.getItem('verify-email') || 'Guest';

    return email;
  }, []);

  const [searchParams] = useSearchParams();

  const methods = useForm<WelcomeInput>({
    resolver: zodResolver(user.isLoggedIn ? welcomeSchemaWithoutPassword : welcomeSchema),
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
    if (user.user?.questionnaireFilled) {
      const params = new URLSearchParams(location.search);
      const returnURL = params.get('returnURL');
      const url = returnURL ? returnURL : '/home';

      navigate(url);
    }

    if (user.user?.name) {
      setStep(STEPS.welcome);
    }

    if (user.isLoggedIn && isRegistrationSuccess) {
      const values = methods.getValues();

      questionnaire({
        companyName: values.companyName,
        id: user.user?.id,
        usePlatformFor: usePlatformFor,
        purposeOfUse: '',
      });
    }
  }, [user]);

  useEffect(() => {
    setTimeout(() => {
      methods.clearErrors();
    });
  }, [step]);

  const onSubmitHandler: SubmitHandler<WelcomeInput> = (values) => {
    if (user.isLoggedIn) {
      questionnaire({
        companyName: values.companyName,
        id: user.user?.id,
        usePlatformFor: usePlatformFor,
        purposeOfUse: '',
      }).unwrap();
    } else {
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
          })
          .catch((error) => {
            methods.setError('password', {
              type: 'Invalid credentials',
              message: error?.data?.message || 'An error occured. Please, try again.',
            });
          });
      }
    }
  };

  const renderStep = (): React.ReactNode => {
    switch (step) {
      case STEPS.password: {
        return (
          <PasswordComponent
            name={name}
            setStep={setStep}
            methods={methods}
          />
        );
      }
      case STEPS.welcome: {
        return (
          <WelcomeComponent
            setStep={setStep}
            methods={methods}
            submitType={submitType}
            setSubmitType={setSubmitType}
          />
        );
      }
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
          {renderStep()}
        </div>
      </form>
    </FormProvider>
  );
};

export default NewWorkspace;
