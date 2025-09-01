import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { RemoveWorkspaceMode } from '@pages/Settings/DeleteOrLeave/types';

import WorkspaceRemoved from './WorkspaceRemoved';

const WorkspaceRemovedContainer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState<RemoveWorkspaceMode>('delete');
  const [name, setName] = useState<string>('workspace');

  useEffect(() => {
    const removeMode = searchParams.get('mode') as RemoveWorkspaceMode | null;
    setMode(removeMode || 'delete');
    const workspaceName = searchParams.get('name') as string | null;
    setName(workspaceName || '');

    const timeoutId = setTimeout(() => {
      navigate('/workspaces', { replace: true });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [searchParams]);

  const label = useMemo(() => {
    const action = mode === 'delete' ? 'deleted' : 'left';
    return `You successfully ${action} the ${name} workspace`;
  }, [mode, name]);

  return <WorkspaceRemoved label={label} />;
};

export default WorkspaceRemovedContainer;
