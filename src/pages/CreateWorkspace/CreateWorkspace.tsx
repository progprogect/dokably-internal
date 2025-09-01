import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import cn from 'classnames';

import { useWorkspaceContext } from '@app/context/workspace/context';

import { CreateWorkspaceInput, createWorkspaceSchema } from './types';
import WorkspaceDetails from './WorkspaceDetails';

const CreateWorkspace = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { createWorkspace } = useWorkspaceContext();

  const [isCompact, setCompact] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(window.innerWidth);

  const methods = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  useEffect(() => {
    if (
      !localStorage.getItem('tokens') &&
      !localStorage.getItem('verify-code') &&
      !(searchParams.get('id') && searchParams.get('signature') && searchParams.get('expires'))
    ) {
      navigate('/login');
    }
  }, []);

  const onSubmitHandler: SubmitHandler<CreateWorkspaceInput> = useCallback(async (values) => {
    await createWorkspace(values.companyName);

    navigate('/home?new=true');
  }, []);

  const checkWidth = () => {
    const isSmallWindowCompact = window.innerWidth < 400;
    const isCompact = window.innerWidth <= 728;
    setCompact(isCompact);
    setWidth(isSmallWindowCompact ? 300 : 400);
  };

  useLayoutEffect(() => {
    window.addEventListener('resize', checkWidth, false);
    return () => {
      window.removeEventListener('resize', checkWidth);
    };
  }, []);

  useLayoutEffect(() => {
    checkWidth();
  }, []);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmitHandler)}>
        <div
          className={cn('mt-58.5 mx-[5px]', { 'mt-[80px]': isCompact })}
          style={{ width: `${width}px` }}
        >
          <WorkspaceDetails methods={methods} />
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateWorkspace;
