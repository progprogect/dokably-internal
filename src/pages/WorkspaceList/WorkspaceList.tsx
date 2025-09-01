import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import type { Workspace } from '@app/context/workspace/types';
import { useWorkspaceContext } from '@app/context/workspace/context';

import { ReactComponent as Logo } from '@images/logo.svg';
import styles from './style.module.scss';

const WorkspaceList = () => {
  const { workspaces, setActiveWorkspace } = useWorkspaceContext();
  const navigate = useNavigate();

  const handlePickWorkspace = useCallback((workspace: Workspace) => {
    setActiveWorkspace(workspace);

    navigate('/home');
  }, []);

  return (
    <>
      <div className={styles.title}>Log in to Dokably</div>
      <div className={styles.subtitle}>Choose one of the workspaces you have access to:</div>
      <div className={styles.workspaceList}>
        {workspaces.map((item) => (
          <div
            key={item.id}
            className={cn(styles.workspaceListItem, styles.workspaceListItem__black)}
            onClick={() => handlePickWorkspace(item)}
          >
            <Logo />
            {item.name}
          </div>
        ))}
      </div>
    </>
  );
};

export default WorkspaceList;
