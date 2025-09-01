import { useWorkspaceContext } from '@app/context/workspace/context';
import AuthLayout from '@pages/layouts/AuthLayout/AuthLayout.component';
import Loading from '@shared/common/Loading';

import WorkspaceList from './WorkspaceList';

const WorkspaceListContainer = () => {
  const { loading } = useWorkspaceContext();

  if (loading) {
    return <Loading />;
  }

  return (
    <AuthLayout>
      <WorkspaceList />
    </AuthLayout>
  );
};

export default WorkspaceListContainer;
