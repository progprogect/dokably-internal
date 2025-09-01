import { useGetUnitQuery } from '@app/queries/unit/useGetUnitQuery';
import { MemberListItem } from './MemberListItem';
import { AccessTypes } from './types';
import toast from 'react-hot-toast';
import { modifyUserAccessLevel, modifyWorkspaceMembersAccessLevel } from '@app/services/share.service';
import { successToastOptions, errorToastOptions } from '@shared/common/Toast';
import { getUnit } from '@app/services/unit.service';
import { useWorkspaceContext } from '@app/context/workspace/context';
import { WorkspaceMembersForUnit } from '@entities/models/workspace';
import * as _ from 'lodash';
import { usePermissionsContext } from '@app/context/permissionsContext/permissionsContext';
import { useEffect, useState } from 'react';

interface Props {
  unitId: string;
  members: WorkspaceMembersForUnit;
  getMembers: () => void;
  updateMembers: (newAccessLevel: AccessTypes) => void;
}
const MembersList: React.FC<Props> = ({ unitId, members, getMembers, updateMembers }) => {
  const { canManageMembers } = usePermissionsContext();
  const { activeWorkspace } = useWorkspaceContext();

  const [workspaceMembersAccess, setWorkspaceMembersAccess] = useState<AccessTypes | undefined>(undefined);

  const { data } = useGetUnitQuery({ unitId, workspaceId: activeWorkspace?.id }, getUnit);

  const handleEditMember = (access: AccessTypes, id: string) => {
    if (!unitId) return;
    try {
      modifyUserAccessLevel(access, id, unitId);
      toast.success('Access level successfully changed!', successToastOptions);
      getMembers();
    } catch (e) {
      toast.error('Unable change access level', errorToastOptions);
    }
  };

  const handleEditWorkspaceMembers = (access: AccessTypes, id: string) => {
    if (!unitId) return;
    try {
      modifyWorkspaceMembersAccessLevel(access, id, unitId);
      setWorkspaceMembersAccess(access);
      updateMembers(access);
      toast.success('Access level successfully changed!', successToastOptions);
    } catch (e) {
      toast.error('Unable change access level', errorToastOptions);
    }
  };

  useEffect(() => {
    setWorkspaceMembersAccess(data?.workspaceMembersAccess);
  }, [data?.workspaceMembersAccess])

  const canChangeRoles = canManageMembers(unitId);
  const roleOrder = ["owner", "member", "quest"];
  
  return (
    <ul>
      <span className='text-[14px] font-medium'>Shared with</span>
      <li>
        <MemberListItem
          showLogo
          onChange={handleEditWorkspaceMembers}
          name='All workspace members'
          email='All workspace members'
          memberId=''
          access={workspaceMembersAccess}
          canChangeRoles={canChangeRoles}
          toTop
        />
      </li>
      {members
        ?.filter((item) => item.access !== workspaceMembersAccess || item.role === "guest")
        ?.sort((a, b) => {
          const indexA = roleOrder.indexOf(a.role);
          const indexB = roleOrder.indexOf(b.role);
          const rankA = indexA === -1 ? Infinity : indexA;
          const rankB = indexB === -1 ? Infinity : indexB;
          return rankA - rankB;
        })
        ?.map((member) => (
          <li key={member.user.id || member.user.name}>
            <MemberListItem
              onChange={handleEditMember}
              imageSrc={member.user.image}
              name={member.user.name}
              email={member.user.email}
              memberId={member.user.id}
              role={member.role}
              access={member.access}
              canChangeRoles={canChangeRoles}
              toTop
            />
          </li>
        ))}
    </ul>
  );
};

export default MembersList;
