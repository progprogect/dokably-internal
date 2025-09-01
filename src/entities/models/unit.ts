import { AccessTypes } from '@widgets/components/ShareDoc/types';
import { Permission } from './unitPermissions';

export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  parentUnit: ParentUnit | null;
  color: string | null;
  isDefault?: boolean;
  createdAt?: Date;
  permissions: Permission[];
  order: number;
  workspaceMembersAccess: AccessTypes;
  emoji?: string | null;
  documents?: Unit[];
}

export interface ParentUnit {
  id?: string;
}

export const mapUnit = (data: any): Unit[] => {
  return data;
};

export type UnitType = 'document' | 'channel' | 'whiteboard' | 'task_board';
