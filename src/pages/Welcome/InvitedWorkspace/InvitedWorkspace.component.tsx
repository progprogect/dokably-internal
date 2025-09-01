import { useEffect, useState } from 'react';
import { IInvitedWorkspace } from './InvitedWorkspace.types';
import { track } from '@amplitude/analytics-browser';
import { Workspace } from '@entities/models/workspace';
import Input from '@shared/common/input';
import Button from '@shared/common/Button';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WelcomeInput, welcomeInvitedSchema } from '../Welcome.types';

const InvitedWorkspace = ({ workspaceId }: IInvitedWorkspace) => {
  const [workspace, setWorkspace] = useState<Workspace>();

  useEffect(() => {
    track('onboarding_password_start');
  }, []);

  const methods = useForm<WelcomeInput>({
    resolver: zodResolver(welcomeInvitedSchema),
  });

  const onSubmitHandler: SubmitHandler<WelcomeInput> = (values) => {
    track('onboarding_completed');
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmitHandler)}>
        <div className='animate__animated animate__fadeIn mt-58.5 w-100'>
          <div className='font-medium text-2xl2 mt-10'>Join Dokably team '{workspace?.name}'</div>
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
              label='Complete'
              type='submit'
              onClick={async () => {
                const valid = await methods.trigger('password');

                if (valid) {
                  track('onboarding_password_completed');
                }
              }}
            />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default InvitedWorkspace;
