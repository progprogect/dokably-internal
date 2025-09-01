import {
  AccessTypes,
  ParticipantType,
} from '@widgets/components/ShareDoc/types';
import { Owner } from './owner';
import { Role } from './role';

export class Workspace {
  private _id: string;
  private _name: string;
  private _subscribed: boolean;
  private _userRole: Role;
  private _numberOfMembers: number;
  private _owner: Owner;

  constructor(
    id: string,
    name: string,
    subscribed: boolean,
    userRole: Role,
    numberOfMembers: number,
    owner: Owner
  ) {
    this._id = id;
    this._name = name;
    this._subscribed = subscribed;
    this._userRole = userRole;
    this._numberOfMembers = numberOfMembers;
    this._owner = owner;
  }

  setWorksapce = (
    id: string,
    name: string,
    subscribed: boolean,
    userRole: Role,
    numberOfMembers: number,
    owner: Owner
  ): Workspace => {
    this.setId(id);
    this.setName(name);
    this.setSubscribed(subscribed);
    this.setUserRole(userRole);
    this.setNumberOfMembers(numberOfMembers);
    this.setOwner(owner);

    return this;
  };

  get id(): string {
    return this.id;
  }

  setId(id: string): Workspace {
    this._id = id;
    return this;
  }

  get name(): string {
    return this._name;
  }

  setName(name: string): Workspace {
    this._name = name;
    return this;
  }
  get subscribed(): boolean {
    return this._subscribed;
  }

  setSubscribed(subscribed: boolean): Workspace {
    this._subscribed = subscribed;
    return this;
  }
  get userRole(): Role {
    return this._userRole;
  }

  setUserRole(userRole: Role): Workspace {
    this._userRole = userRole;
    return this;
  }
  get numberOfMembers(): number {
    return this._numberOfMembers;
  }

  setNumberOfMembers(numberOfMembers: number): Workspace {
    this._numberOfMembers = numberOfMembers;
    return this;
  }
  get owner(): Owner {
    return this._owner;
  }

  setOwner(owner: Owner): Workspace {
    this._owner = owner;
    return this;
  }
}

export const mapWorkspace = (data: any): Workspace => {
  return data as Workspace;
};

export const mapFirstWorkspace = (data: any): Workspace => {
  return data[0] as Workspace;
};

export const mapWorkspaces = (data: any): Workspace[] => {
  return data as Workspace[];
};
export interface IGuest {
  id: string;
  email: string;
  name: string;
  deleted: boolean;
  image?: string; // Path to avatar - NOT implemented on the BE
}

export interface WorkspaceMemberForUnit {
  user: IGuest;
  role: ParticipantType;
  access: AccessTypes;
}

export type WorkspaceMembersForUnit = WorkspaceMemberForUnit[];
