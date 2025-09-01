import { type ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useImmerReducer } from 'use-immer';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

import { errorToastOptions, successToastOptions } from '@shared/common/Toast';
import { selectCurrentUser } from '@app/redux/features/userSlice';

import { createWorkspaceRequest } from '@app/queries/workspace/useCreateWorkspace';
import { getWorkspacesRequest } from '@app/queries/workspace/useGetWorkspaces';
import { editWorkspaceRequest } from '@app/queries/workspace/useEditWorkspace';
import { deleteWorkspaceRequest } from '@app/queries/workspace/useDeleteWorkspace';
import { leaveWorkspaceRequest } from '@app/queries/workspace/useLeaveWorkspace';
import { getWorkspaceMembersRequest } from '@app/queries/workspace/useGetWorkspaceMembers';
import { getWorkspaceGuestsRequest } from '@app/queries/workspace/useGetWorkspaceGuests';
import { deleteWorkspaceUserRequest } from '@app/queries/workspace/useDeleteWorkspaceUser';
import { transferWorkspaceRequest } from '@app/queries/workspace/useTransferWorkspace';

import type { WorkspaceState, WorkspaceAction, Workspace, WorkspaceMember } from '../types';
import { getActiveWorkspace } from '../utils';
import {
  createSetLoadingAction,
  createSetShouldInitWorkspaceAction,
  createSetActiveWorkspaceAction,
  createSetWorkspacesAction,
  createSetMembersAction,
  createSetGuestsAction,
  createSetInviteLinkAction,
} from '../actions';
import { reducer } from '../reducer';
import { initialState, LAST_ACTIVE_WORKSPACE_ID_KEY } from '../constants';
import { WorkspaceContext } from '../context';
import { createWorkspaceInviteLinkRequest } from '@app/queries/workspace/useCreateWorkspaceInviteLink';
import { joinWorkspaceRequest } from '@app/queries/workspace/useJoinWorkspace';
import { getWorkspaceRequest } from '@app/queries/workspace/useGetWorkspace';
import { changeWorkspaceUserRoleRequest } from '@app/queries/workspace/useChangeWorkspaceUserRole';

type WorkspaceContextProviderProps = {
  children: ReactNode;
};

export function WorkspaceContextProvider({ children }: WorkspaceContextProviderProps) {
  const userData = useSelector(selectCurrentUser);

  const [state, dispatch] = useImmerReducer<WorkspaceState, WorkspaceAction>(reducer, initialState);

  const { loading, workspaces, activeWorkspace, shouldInitWorkspace, members, guests, inviteLink } = state;

  const setActiveWorkspace = useCallback(
    async (workspace: Workspace | undefined) => {
      dispatch(createSetShouldInitWorkspaceAction(!workspace));
      dispatch(createSetActiveWorkspaceAction(workspace));

      if (workspace) localStorage.setItem(LAST_ACTIVE_WORKSPACE_ID_KEY, workspace.id);
      else localStorage.removeItem(LAST_ACTIVE_WORKSPACE_ID_KEY);

      if (!workspace) return;

      const canGetWorkspaceMembers =
        workspace.userRole === 'owner' ||
        workspace.userRole === 'member';
        // workspace.userRole === 'guest' ||
        // userData.user?.accessType === 'anonymous';

      const [workspaceMembers, workspaceGuests, workspaceInviteLink] = await Promise.all([
        canGetWorkspaceMembers ? getWorkspaceMembersRequest(workspace?.id) : Promise.resolve(),
        canGetWorkspaceMembers ? getWorkspaceGuestsRequest(workspace?.id) : Promise.resolve(),
        createWorkspaceInviteLinkRequest({ id: workspace?.id, role: 'member' }),
      ]);

      dispatch(createSetMembersAction(workspaceMembers || []));
      dispatch(createSetGuestsAction(workspaceGuests || []));
      dispatch(createSetInviteLinkAction(workspaceInviteLink));
    },
    [dispatch, userData],
  );

  const transferWorkspace = useCallback(
    async (data: WorkspaceMember) => {
      if (!activeWorkspace) return;

      const { name, email } = data.user;

      try {
        dispatch(createSetLoadingAction(true));

        await transferWorkspaceRequest({ id: activeWorkspace.id, userId: data.user.id });

        const workspacesData = await getWorkspacesRequest();

        dispatch(createSetWorkspacesAction((workspacesData as Workspace[]) || []));

        const workspace = getActiveWorkspace(workspacesData as Workspace[]);
        await setActiveWorkspace(workspace);

        const label = name
          ? `Ownership successfully transferred to '${name} (${email})'.`
          : `Ownership successfully transferred to '${email}'`;
        toast.success(label, successToastOptions);
      } catch (e) {
        const label = name
          ? `Failed to transfer ownership to '${name} (${email})'.  Please try again.`
          : `Failed to transfer ownership to '${email}'. Please try again.`;
        toast.success(label, successToastOptions);
      } finally {
        dispatch(createSetLoadingAction(false));
      }
    },
    [dispatch, activeWorkspace, members, guests],
  );

  const createWorkspace = useCallback(
    async (name: string) => {
      try {
        dispatch(createSetLoadingAction(true));

        const workspace = await createWorkspaceRequest({ name });
        dispatch(createSetWorkspacesAction([...workspaces, workspace]));

        await setActiveWorkspace(workspace);
      } catch (e) {
        toast.error('Error while creating workspace. Please try again.', errorToastOptions);
      } finally {
        dispatch(createSetLoadingAction(false));
      }
    },
    [dispatch, workspaces, setActiveWorkspace],
  );

  const editWorkspace = useCallback(
    async (data: Pick<Workspace, 'id' | 'name'>) => {
      try {
        dispatch(createSetLoadingAction(true));

        const workspace = await editWorkspaceRequest({ id: data.id, data });

        const items = workspaces.map((item: Workspace) =>
          item.id === workspace.id ? { ...item, ...workspace } : item,
        );
        dispatch(createSetWorkspacesAction([...items]));

        await setActiveWorkspace(workspace);
      } catch (e) {
        toast.error('Error while editing workspace. Please try again.', errorToastOptions);
      } finally {
        dispatch(createSetLoadingAction(false));
      }
    },
    [dispatch, workspaces],
  );

  const deleteWorkspace = useCallback(
    async (id: string) => {
      try {
        dispatch(createSetLoadingAction(true));

        await deleteWorkspaceRequest(id);

        const items = workspaces.filter((item: Workspace) => item.id !== id);
        dispatch(createSetWorkspacesAction([...items]));

        const workspace = getActiveWorkspace(items, true);
        await setActiveWorkspace(workspace);
      } catch (e) {
        toast.error('Error while deleting workspace. Please try again.', errorToastOptions);
      } finally {
        dispatch(createSetLoadingAction(false));
      }
    },
    [dispatch, workspaces, setActiveWorkspace],
  );

  const deleteWorkspaceUser = useCallback(
    async (data: WorkspaceMember) => {
      if (!activeWorkspace) return;

      const { name, email } = data.user;

      try {
        dispatch(createSetLoadingAction(true));

        await deleteWorkspaceUserRequest({ id: activeWorkspace.id, userId: data.user.id });

        if (data.role === 'member') {
          const items = members.filter((member: WorkspaceMember) => member.user.id !== data.user.id);
          dispatch(createSetMembersAction([...items]));
        } else {
          const items = guests.filter((guest: WorkspaceMember) => guest.user.id !== data.user.id);
          dispatch(createSetGuestsAction([...items]));
        }

        const label = name
          ? `The user '${name} (${email})' has been deleted.`
          : `The user '${email}' has been deleted.`;
        toast.success(label, successToastOptions);
      } catch (e) {
        const label = name
          ? `The user '${name} (${email})' has not been deleted.  Please try again.`
          : `The user '${email}' has not been deleted. Please try again.`;
        toast.success(label, successToastOptions);
      } finally {
        dispatch(createSetLoadingAction(false));
      }
    },
    [dispatch, activeWorkspace, members, guests],
  );

  const changeWorkspaceUserRole = useCallback(
    async (data: WorkspaceMember) => {
      if (!activeWorkspace) return;

      const { name, email } = data.user;

      try {
        dispatch(createSetLoadingAction(true));

        await changeWorkspaceUserRoleRequest({ id: activeWorkspace.id, userId: data.user.id, role: 'member' });

        dispatch(createSetMembersAction([...members, { ...data, role: 'member' }]));

        const updatedGuests = guests.filter((guest: WorkspaceMember) => guest.user.id !== data.user.id);
        dispatch(createSetGuestsAction([...updatedGuests]));

        const label = name
          ? `The user '${name} (${email})' has been converted.`
          : `The user '${email}' has been converted.`;
        toast.success(label, successToastOptions);
      } catch (e) {
        const label = name
          ? `The user '${name} (${email})' has not been converted.  Please try again.`
          : `The user '${email}' has not been converted. Please try again.`;
        toast.success(label, successToastOptions);
      } finally {
        dispatch(createSetLoadingAction(false));
      }
    },
    [dispatch, activeWorkspace, members, guests],
  );

  const leaveWorkspace = useCallback(
    async (id: string) => {
      try {
        dispatch(createSetLoadingAction(true));

        await leaveWorkspaceRequest(id);

        const items = workspaces.filter((item: Workspace) => item.id !== id);
        dispatch(createSetWorkspacesAction([...items]));

        const workspace = getActiveWorkspace(items, true);
        await setActiveWorkspace(workspace);
      } catch (e) {
        toast.error('Error while leaving workspace. Please try again.', errorToastOptions);
      } finally {
        dispatch(createSetLoadingAction(false));
      }
    },
    [dispatch, workspaces, setActiveWorkspace],
  );

  const joinWorkspace = useCallback(
    async (id: string, inviteId: string) => {
      try {
        dispatch(createSetLoadingAction(true));

        await joinWorkspaceRequest({ id, inviteId });

        const workspace = await getWorkspaceRequest(id);

        if (workspace) {
          const hasJoinedBefore = workspaces.some((item: Workspace) => item.id === id);

          if (!hasJoinedBefore) dispatch(createSetWorkspacesAction([workspace, ...workspaces]));

          await setActiveWorkspace(workspace);

          if (!hasJoinedBefore) toast.success('Invitation accepted!', successToastOptions);
        } else {
          const fallback = getActiveWorkspace(workspaces, true);
          await setActiveWorkspace(fallback);
        }
      } catch (e) {
        toast.error('Error while joining workspace. Please try again.', errorToastOptions);
      } finally {
        dispatch(createSetLoadingAction(false));
      }
    },
    [dispatch, workspaces, setActiveWorkspace],
  );

  const joinWorkspaceUnit = useCallback(
    async (workspaceId: string) => {
      try {
        dispatch(createSetLoadingAction(true));

        const workspace = await getWorkspaceRequest(workspaceId);

        if (workspace) {
          const hasJoinedBefore = workspaces.some((item: Workspace) => item.id === workspaceId);

          if (!hasJoinedBefore) dispatch(createSetWorkspacesAction([workspace, ...workspaces]));

          await setActiveWorkspace(workspace);
        } else {
          const fallback = getActiveWorkspace(workspaces, true);
          await setActiveWorkspace(fallback);
        }
      } catch (e) {
        toast.error('Error while joining workspace unit. Please try again.', errorToastOptions);
      } finally {
        dispatch(createSetLoadingAction(false));
      }
    },
    [dispatch, workspaces, setActiveWorkspace],
  );

  const initContext = useCallback(async () => {
    try {
      dispatch(createSetLoadingAction(true));

      const workspacesData = await getWorkspacesRequest();

      dispatch(createSetWorkspacesAction((workspacesData as Workspace[]) || []));

      if (
        userData.user?.userSetPassword &&
        !userData.user.questionnaireFilled &&
        (!workspacesData || workspacesData.length === 0)
      ) {
        return;
      }

      const workspace = getActiveWorkspace(workspacesData as Workspace[]);
      await setActiveWorkspace(workspace);
    } catch (e) {
      toast.error('Error while fetching workspaces. Please try again.', errorToastOptions);
    } finally {
      dispatch(createSetLoadingAction(false));
    }
  }, [dispatch, setActiveWorkspace, userData]);

  useEffect(() => {
    if (!userData.isLoggedIn) return;

    void initContext();
  }, [userData]);

  const activeMembers = useMemo(() => members.filter((member: WorkspaceMember) => !member.user.deleted), [members]);
  const activeGuests = useMemo(() => guests.filter((guest: WorkspaceMember) => !guest.user.deleted), [guests]);

  const workspaceContextProviderValue = useMemo(
    () => ({
      loading,
      workspaces,
      activeWorkspace,
      shouldInitWorkspace,
      createWorkspace,
      setActiveWorkspace,
      editWorkspace,
      deleteWorkspace,
      leaveWorkspace,
      members,
      activeMembers,
      guests,
      activeGuests,
      deleteWorkspaceUser,
      transferWorkspace,
      inviteLink,
      joinWorkspace,
      changeWorkspaceUserRole,
      joinWorkspaceUnit,
    }),
    [
      loading,
      workspaces,
      activeWorkspace,
      shouldInitWorkspace,
      createWorkspace,
      setActiveWorkspace,
      editWorkspace,
      deleteWorkspace,
      leaveWorkspace,
      members,
      activeMembers,
      guests,
      activeGuests,
      deleteWorkspaceUser,
      transferWorkspace,
      inviteLink,
      joinWorkspace,
      changeWorkspaceUserRole,
      joinWorkspaceUnit,
    ],
  );

  return <WorkspaceContext.Provider value={workspaceContextProviderValue}>{children}</WorkspaceContext.Provider>;
}
