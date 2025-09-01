import { useState, useEffect, useCallback } from 'react';
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { track } from '@amplitude/analytics-browser';

import { useWorkspaceContext } from '@app/context/workspace/context';
import Input from '@shared/common/input';
import Button from '@shared/common/Button';
import useUser from '@app/hooks/useUser';

import { DeleteOrLeave } from './DeleteOrLeave/DeleteOrLeave';

const generalSettingsSchema = object({
  workspace: string().min(3, 'Workspace is required'),
});

type GeneralSettingsInput = TypeOf<typeof generalSettingsSchema>;

const GeneralSettings = () => {
  const { activeWorkspace, loading, editWorkspace } = useWorkspaceContext();

  const [showChangeWorkspace, setShowChangeWorkspace] = useState(false);

  const methods = useForm<GeneralSettingsInput>({
    resolver: zodResolver(generalSettingsSchema),
  });

  const watchWorkspace = methods.watch('workspace');

  const user = useUser();

  useEffect(() => {
    track('general_settings_opened');
  }, []);

  useEffect(() => {
    if (!activeWorkspace) return;

    methods.setValue('workspace', activeWorkspace.name || '');
  }, [activeWorkspace]);

  useEffect(() => {
    if (methods.formState.dirtyFields.workspace && !showChangeWorkspace) {
      setShowChangeWorkspace(true);
    }
  }, [watchWorkspace]);

  const onCancelChangeWorkspace = () => {
    if (!activeWorkspace) {
      return;
    }

    setShowChangeWorkspace(false);
    methods.resetField('workspace');
    methods.setValue('workspace', activeWorkspace.name || '');
  };

  const handleChangeWorkspaceName = useCallback(async () => {
    if (!activeWorkspace) {
      return;
    }

    const valid = await methods.trigger('workspace');

    if (valid) {
      editWorkspace({
        name: methods.getValues('workspace'),
        id: activeWorkspace.id || '',
      })
        .then(() => {
          track('general_settings_ws_name_changed');
          setShowChangeWorkspace(false);
        })
        .catch((error) => {
          track('general_settings_ws_name_changed_failed', {
            reason: error.data.message || 'An error occured. Please, try again.',
          });
          methods.setError('workspace', {
            type: 'Invalid credentials',
            message: error.data.message || 'An error occured. Please, try again.',
          });
        });
    }
  }, [activeWorkspace, methods, editWorkspace]);

  if (!activeWorkspace) return null;
  if (!user) return null;

  return (
    <FormProvider {...methods}>
      <div className='text-2xl3 text-text90'>General</div>
      <div className='font-medium text-sm text-text50 mt-12.5'>Workspace name</div>
      <div className='mt-2 flex items-center'>
        <div className='w-65 mr-3'>
          <Input
            name='workspace'
            type='text'
            disabled={user.id !== activeWorkspace?.owner?.id}
          />
        </div>
        {showChangeWorkspace && (
          <>
            <Button
              label='Cancel'
              className='mr-2'
              styleType='small-gray'
              onClick={onCancelChangeWorkspace}
            />
            <Button
              label='Change'
              styleType='small-primary'
              disabled={loading}
              isLoading={loading}
              onClick={handleChangeWorkspaceName}
            />
          </>
        )}
      </div>
      <div className='mt-7.5 h-px bg-text10'></div>
      <DeleteOrLeave />
    </FormProvider>
  );
};

export default GeneralSettings;
