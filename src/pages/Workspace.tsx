import { useWorkspaceContext } from "@app/context/workspace/context";
import { getWorkspacesRequest } from "@app/queries/workspace/useGetWorkspaces";
import Loading from "@shared/common/Loading";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Workspace = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { setActiveWorkspace } = useWorkspaceContext();

  const updateActiveWorkspace = async () => {
    const workspaces = await getWorkspacesRequest();
    const targetWorkspace = workspaces.find((workspace) => workspace.id === workspaceId);
    if (targetWorkspace) setActiveWorkspace(targetWorkspace);
		navigate("/home");
  };

  useEffect(() => {
    if (!!workspaceId) {
      updateActiveWorkspace();
    }
  }, [workspaceId]);

	return <Loading />;
};

export default Workspace;
