import { BASE_API } from '@app/constants/endpoints';
import { WorkspaceMembersForUnit } from '@entities/models/workspace';
import customFetch from '@app/utils/customFetch';
import { AccessTypes, ParticipantType } from '@widgets/components/ShareDoc/types';

const membersMock = [
  {
    user: {
      id: '6433625b1d4b3b6d101b5c70',
      email: 'morsewoodard@prismatic.com',
      name: 'Ruby Hatfield',
      deleted: false,
    },
    access: 'edit',
    role: 'owner',
  },
  {
    user: {
      id: '6433625b6bc0b74118d33304',
      email: 'rubyhatfield@prismatic.com',
      name: 'Britney Knight',
      deleted: false,
    },
    access: 'comment',
    role: 'admin',
  },
  {
    user: {
      id: '6433625bcce601aba3aa9bc1',
      email: 'britneyknight@prismatic.com',
      name: 'Faye Barnett',
      deleted: true,
    },
    access: 'full_access',
    role: 'owner',
  },
  {
    user: {
      id: '6433625b0968ba1bb8c57fe6',
      email: 'fayebarnett@prismatic.com',
      name: 'Underwood Schroeder',
      deleted: false,
    },
    access: 'view',
    role: 'guest',
  },
  {
    user: {
      id: '6433625b02d919ced154c9a3',
      email: 'underwoodschroeder@prismatic.com',
      name: 'Leonor Montgomery',
      deleted: true,
    },
    access: 'full_access',
    role: 'member',
  },
  {
    user: {
      id: '6433625bf97eb4f4b4fa28d8',
      email: 'leonormontgomery@prismatic.com',
      name: 'William Park',
      deleted: false,
    },
    access: 'edit',
    role: 'admin',
  },
  {
    user: {
      id: '6433625b32a4a133c22c13d9',
      email: 'williampark@prismatic.com',
      name: 'Nielsen Owen',
      deleted: true,
    },
    access: 'view',
    role: 'member',
  },
];

export const getMembersForUnit = async (
  unitId: string,
  options?: { signal?: AbortSignal },
): Promise<WorkspaceMembersForUnit> => {
  const rawResponse = await customFetch(`${BASE_API}/frontend/unit/${unitId}/member`, options);
  return await rawResponse.json();
};

export type User = {
  id: string;
  email: string;
  name: string;
  deleted?: boolean;
  imageSrc?: string;
};

export const searchUsers = async (searchString: string, documentId: string): Promise<User[] | null> => {
  if (!documentId) return null;
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/unit/${documentId}/member/autocomplete?${new URLSearchParams({ search: searchString })}`,
  );

  if (!rawResponse.ok) return [];
  return await rawResponse.json();
};

export interface IGetLink {
  access: AccessTypes;
  role: ParticipantType;
  subDocs?: boolean; // Check after backend update
}

export interface IInviteLinkResult {
  link: string;
}

export const getInviteLink = async (data: IGetLink, documentId?: string): Promise<IInviteLinkResult | null> => {
  if (!documentId) return null;
  const rawResponse = await customFetch(`${BASE_API}/frontend/unit/${documentId}/invite-link`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!rawResponse.ok) return { link: '' };
  return await rawResponse.json();
};

export interface ShareUnitResult {
  hash: string;
}

export const getShareLink = async (access: AccessTypes, unitId: string): Promise<ShareUnitResult> => {
  const rawResponse = await customFetch(`${BASE_API}/frontend/unit/${unitId}/share`, {
    method: 'POST',
    body: JSON.stringify({
      access,
    }),
  });
  if (!rawResponse.ok) return { hash: '' };
  return await rawResponse.json();
};

export const getWorkspaceInviteLink = async (
  data: IGetLink,
  worlspaceId?: string,
): Promise<IInviteLinkResult | null> => {
  if (!worlspaceId) return null;
  const rawResponse = await customFetch(`${BASE_API}/frontend/workspace/${worlspaceId}/invite-link`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!rawResponse.ok) return { link: '' };
  return await rawResponse.json();
};

export const modifyUserAccessLevel = async (newLevel: AccessTypes, userId: string, documentId?: string) => {
  if (!documentId) return null;
  const rawResponse = await customFetch(`${BASE_API}/frontend/unit/${documentId}/user/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ access: newLevel }),
  });
  return await rawResponse.json();
};

export const modifyWorkspaceMembersAccessLevel = async (newLevel: AccessTypes, userId: string, documentId?: string) => {
  if (!documentId) return null;
  const rawResponse = await customFetch(`${BASE_API}/frontend/unit/${documentId}/workspace-members-access`, {
    method: 'PATCH',
    body: JSON.stringify({ access: newLevel }),
  });
  return await rawResponse.json();
};

export interface IInvitePayload {
  emails: string[];
  access: AccessTypes;
  role: Omit<'owner', ParticipantType>;
}

export const inviteMembers = async (payload: IInvitePayload, documentId?: string) => {
  if (!documentId) return null;
  const rawResponse = await customFetch(`${BASE_API}/frontend/unit/${documentId}/invite`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return rawResponse;
};
