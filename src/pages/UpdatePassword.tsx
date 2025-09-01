import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';

import Input from '@shared/common/input';
import Button from '@shared/common/Button';

import { useUpdatePasswordMutation } from '@app/redux/api/authApi';

const updatePasswordSchema = object({
  password: string()
    .min(1, 'Password address is required')
    .min(8, 'Password is to short'),
});

export type UpdatePasswordInput = TypeOf<typeof updatePasswordSchema>;

const UpdatePasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [updatePassword, { isLoading, isSuccess }] =
    useUpdatePasswordMutation();

  React.useEffect(() => {
    if (isSuccess) {
      navigate('/login');
    }
  }, [isSuccess, navigate]);

  const methods = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmitHandler: SubmitHandler<UpdatePasswordInput> = (values) => {
    const id = searchParams.get('id') || '';
    const signature = searchParams.get('signature') || '';
    const expires = searchParams.get('expires') || '';
    const params = new URLSearchParams({ signature, expires }).toString();

    updatePassword({ ...values, id, params })
      .unwrap()
      .catch((error) => {
        if (error.status === 422) {
          methods.setError('password', {
            type: 'Invalid credentials',
            message: 'Some error! Reset password again',
          });
        } else {
          methods.setError('password', {
            type: 'Invalid credentials',
            message: 'Some error!',
          });
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmitHandler)}>
        <div className='text-center font-medium text-2xl leading-8.5'>
          Create new password
        </div>
        <div className='text-center mt-4 mb-14 opacity-60 text-sm'>
          Minimum 8 characters, use a mix of alphabetical and numeric
          characters.
        </div>
        <Input
          name='password'
          type='password'
          placeholder='Password'
          disabled={isLoading}
        />
        <Button
          className='bg-primary hover:bg-primary/90 text-white font-medium mt-6 disabled:bg-primary/90 text-base leading-5'
          type='submit'
          label='Send'
          isLoading={isLoading}
          disabled={isLoading}
          styleType='primary'
        />
        <div className='text-center underline cursor-pointer mt-12 opacity-60 text-sm'>
          <Link to='/login'>Go back to Login</Link>
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdatePasswordPage;
