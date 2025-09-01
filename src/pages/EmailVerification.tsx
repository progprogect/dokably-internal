import React from 'react';
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import cn from 'classnames';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  useVerifyCodeMutation,
  useVerifyEmailMutation,
} from '@app/redux/api/authApi';

import Input from '@shared/common/input';
import { ReactComponent as Loader } from '@images/loader.svg';
import { track } from '@amplitude/analytics-browser';

const DEFAULT_REMAINING = 120000;

const EmailVerificationSchema = object({
  code: string(),
  email: string().email(),
});

export type EmailVerificationInput = TypeOf<typeof EmailVerificationSchema>;

const EmailVerification = () => {
  const [email] = React.useState(
    localStorage.getItem('verify-email') || 'your@email.com'
  );
  const [remaining, setRemaining] = React.useState<number>(0);
  const timer = React.useRef<number | null>(null);
  const remainingRef = React.useRef<number>(0);

  const navigate = useNavigate();
  const location = useLocation();

  const methods = useForm<EmailVerificationInput>({
    resolver: zodResolver(EmailVerificationSchema),
  });

  const [verifyCode, { isLoading, isSuccess }] = useVerifyCodeMutation();
  const [verifyEmail, { isLoading: isResending }] = useVerifyEmailMutation();

  const applyTimer = (initial: number) => {
    remainingRef.current = initial;
    setRemaining(initial);

    const timerId = window.setInterval(() => {
      const newRemaining = remainingRef.current - 1000;

      remainingRef.current = newRemaining;
      setRemaining(newRemaining);
      if (newRemaining <= 0) {
        window.clearInterval(timerId);
        localStorage.removeItem('remaining');
      }
    }, 1000);

    timer.current = timerId;
  };

  React.useEffect(() => {
    if (isSuccess) {
      const url = location.search ? `/welcome${location.search}` : '/welcome';

      navigate(url);
    }
  }, [isSuccess, navigate]);

  React.useEffect(() => {
    const subscription = methods.watch((value) => {
      if (value.code?.length === 6) {
        methods.handleSubmit(onSubmitHandler)();
      }
    });

    const remaining = +(localStorage.getItem('remaining') || '');

    if (remaining && +new Date() - remaining < DEFAULT_REMAINING) {
      applyTimer(DEFAULT_REMAINING - (+new Date() - remaining));
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [methods]);

  const onSubmitHandler: SubmitHandler<EmailVerificationInput> = (values) => {
    const code = values.code.replace('-', '');

    verifyCode({ code, email: values.email })
      .unwrap()
      .then(() => {
        track('signup_email_verification_completed');
      })
      .catch((error) => {
        methods.setError('code', {
          type: 'invalidCode',
          message: error.data.message,
        });
      });
  };

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (
      isNaN(+event.currentTarget.value.slice(-1)) ||
      event.currentTarget.value.length > 6
    ) {
      event.currentTarget.value = methods.getValues('code');
    }
  };

  const onResendCode = () => {
    if (remaining > 0) return;
    track('signup_email_verification_resend', { try_attempt: 'try_attempt' });
    verifyEmail({ email }).then((response: any) => {
      if (response.error) return;

      localStorage.setItem('remaining', +new Date() + '');
      applyTimer(DEFAULT_REMAINING);
    });
  };

  const convertMsToMinutesSeconds = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.round((milliseconds % 60000) / 1000);

    const padTo2Digits = (num: number) => {
      return num.toString().padStart(2, '0');
    };

    return seconds === 60
      ? `${minutes + 1}:00`
      : `${minutes}:${padTo2Digits(seconds)}`;
  };

  return (
    <FormProvider {...methods}>
      <div className='text-center font-medium text-2xl'>
        Verify your email address
      </div>
      <div className='text-center mt-4 text-text60 text-sml'>
        We've sent a 6-digit confirmation code
        <br /> to {email}. Enter it below:
      </div>
      <Input name='email' className='hidden' defaultValue={email} />
      <div className='mt-10'>
        <Input
          id='emailCode'
          name='code'
          type='text'
          className='text-center text-2xl leading-3.5 font-medium py-3'
          placeholder='123456'
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div
        className='text-center mt-12.5 text-text60 text-sms'
        style={{ position: 'relative', width: '313px', right: '6px' }}
      >
        Keep this window open while checking for code.
      </div>
      <div className='flex justify-center items-center text-sms mt-1'>
        <div
          className={cn('text-text60', {
            'underline cursor-pointer hover:text-text90': remaining <= 0,
          })}
          onClick={onResendCode}
        >
          Resend code
        </div>
        {isResending && (
          <Loader className='ml-2 inline w-4 h-4 text-primary animate-spin' />
        )}
        {!!(remaining > 1) && (
          <div className='ml-1 text-text60'>
            in&nbsp;{convertMsToMinutesSeconds(remaining)}
          </div>
        )}
      </div>
    </FormProvider>
  );
};

export default EmailVerification;
