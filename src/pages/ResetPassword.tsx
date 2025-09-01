import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';

import Input from '@shared/common/input';
import Button from '@shared/common/Button';
import { ReactComponent as Mail } from '@images/mail.svg';

import { useResetPasswordMutation } from '@app/redux/api/authApi';
import { track } from '@amplitude/analytics-browser';

const resetPasswordSchema = object({
  email: string()
    .min(1, 'Email address is required')
    .email('Email Address is invalid'),
});

export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string>('');

  const [resetPassword, { isLoading, isSuccess }] = useResetPasswordMutation();
  const location = useLocation();

  React.useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
    }
  }, [isSuccess]);

  const methods = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmitHandler: SubmitHandler<ResetPasswordInput> = (values) => {
    track('code_send_clicked');
    setServerError('');

    resetPassword(values)
      .unwrap()
      .catch((error) => {
        if (error.status === 400) {
          methods.setError('email', {
            type: 'Invalid credentials',
            message: error.data.message,
          });
        } else {
          setServerError(
            error?.data?.message ||
              'An error occured. Please, try to reset password again.'
          );
        }
      });
  };

  React.useEffect(() => {
    document.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();

        const onSubmit = methods.handleSubmit(onSubmitHandler);
        onSubmit();
      }
    });
  }, []);

  const goBackToLogin = () => {
    const url = location.search ? `/login${location.search}` : '/login';

    return <Link to={url}>Go back to Login</Link>;
  };

  return (
    <>
      {!showSuccess && (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmitHandler)}>
            <div className='text-center font-medium text-2xl'>
              Reset password
            </div>
            <div className='text-center mt-4 text-text60 text-sml'>
              Enter the email associated with your account and we’ll send an
              email with instructions to reset your password.
            </div>
            <div className='mt-10'>
              <Input
                name='email'
                type='email'
                placeholder='Email'
                disabled={isLoading}
              />
            </div>
            <Button
              className='mt-4'
              type='submit'
              label='Send'
              isLoading={isLoading}
              disabled={isLoading}
              styleType='primary'
            />
            {serverError && (
              <div className='mt-1.5 text-errorText text-xs'>{serverError}</div>
            )}
            <div className='text-center underline cursor-pointer mt-12 text-text60 text-sml'>
              {goBackToLogin()}
            </div>
          </form>
        </FormProvider>
      )}
      {showSuccess && (
        <div>
          <div className='text-center font-medium text-2xl'>
            Check your email
          </div>
          <div className='text-center mt-4 text-text60 text-sml'>
            We’ve sent a password recover instructions to your email.
          </div>
          <div className='flex justify-center mt-10'>
            <Mail />
          </div>
          <div className='text-center mt-10 text-text60 text-sml'>
            Didn’t receive email?
            <br />
            Check your spam filter or&nbsp;
            <div
              className='underline cursor-pointer inline-block hover:text-text90'
              onClick={() => {
                track('code_resend_clicked', { try_attempt: 'try_attempt' });
                setShowSuccess(false);
              }}
            >
              try again
            </div>
          </div>
          <div className='text-center underline cursor-pointer mt-7.5 text-text60 text-sml'>
            {goBackToLogin()}
          </div>
        </div>
      )}
    </>
  );
};

export default ResetPasswordPage;
