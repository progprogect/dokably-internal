import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import _ from 'lodash';

import {
  Permission,
  UNIT_PERMISSION_ADD_DOC,
  UNIT_PERMISSION_ADD_SUB_DOC,
  UNIT_PERMISSION_DELETE,
  UNIT_PERMISSION_DUPLICATE,
  UNIT_PERMISSION_EDIT,
  UNIT_PERMISSION_MANAGE_MEMBERS,
  // UNIT_PERMISSION_SHARE,
  UNIT_PERMISSION_SHARE_INVITE,
  UNIT_PERMISSION_SHARE_INVITE_LINK,
  UNIT_PERMISSION_VIEW,
} from '@entities/models/unitPermissions';
import { Unit } from '@entities/models/unit';
import { getUnitPermission, getUnits } from '@app/services/unit.service';

import { useWorkspaceContext } from '../workspace/context';

export type UnitsPermissionsMapType = Record<Unit['id'], Permission[]>;

export type PermissionsContextValueType = {
  getUnitPermissionsAndUpdate: (unitId: string) => Promise<Permission[]>;
  fetchUnitItemPermissions: (unitId: string) => Promise<Permission[]>;
  updatePermissionsInWorkspace: (unitIds: string[]) => Promise<UnitsPermissionsMapType>;
  getUnitPermissions: (unitId: string) => Permission[];
  savePermissionsForUnits: (units: Unit[]) => void;
  getUnitsToShow: (units: Unit[]) => Unit[];
  canDuplicateUnit: (unitId: string) => boolean;
  canAddDoc: (unitId: string) => boolean;
  canAddSubDoc: (unitId: string) => boolean;
  canEditUnit: (unitId: string) => boolean;
  // canShareUnit: (unitId: string) => boolean;
  canShareInviteUnit: (unitId: string) => boolean;
  canShareInviteLinkUnit: (unitId: string) => boolean;
  canDeleteUnit: (unitId: string) => boolean;
  canManageMembers: (unitId: string) => boolean;
};

const PermissionsContext = createContext<PermissionsContextValueType>({
  getUnitPermissionsAndUpdate: async () => [],
  fetchUnitItemPermissions: async () => [],
  updatePermissionsInWorkspace: async () => ({}),
  getUnitPermissions: () => [],
  savePermissionsForUnits: () => {},
  getUnitsToShow: () => [],
  canDuplicateUnit: () => false,
  canAddDoc: () => false,
  canAddSubDoc: () => false,
  canEditUnit: () => false,
  // canShareUnit: () => false,
  canShareInviteUnit: () => false,
  canShareInviteLinkUnit: () => false,
  canDeleteUnit: () => false,
  canManageMembers: () => false,
} as PermissionsContextValueType);

export const PermissionsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { activeWorkspace } = useWorkspaceContext();
  const [unitPermissionsMap, setUnitPermissionsMap] = useState<UnitsPermissionsMapType>({});

  const fetchUnitItemPermissions = useCallback(async (unitId: string) => {
    try {
      const result = await getUnitPermission(unitId);
      return result.permissions;
    } catch (error) {
      console.error('Error during fetching permissions: ', JSON.stringify(error));
      return [];
    }
  }, []);

  const extractPermissionsMapFromUnits = useCallback((units: Unit[]): UnitsPermissionsMapType => {
    const mapById = _.keyBy(units, (item) => item.id);
    const flattenMapById = _.mapValues(mapById, 'permissions');
    return flattenMapById;
  }, []);

  const extractPermissionsFromUnitsAndSave = useCallback(
    (units: Unit[]) => {
      const permissionsMap = extractPermissionsMapFromUnits(units);

      setUnitPermissionsMap((prevState) => ({
        ...prevState,
        ...permissionsMap,
      }));
    },
    [extractPermissionsMapFromUnits],
  );

  const fetchPermissionsInWorkspace = useCallback(
    async (workspaceId: string): Promise<UnitsPermissionsMapType> => {
      try {
        const downloadedUnitsWithPermissions = await getUnits(workspaceId);
        const permissionsMap = extractPermissionsMapFromUnits(downloadedUnitsWithPermissions);

        return permissionsMap;
      } catch (error) {
        console.error('Error during fetching permissions: ', JSON.stringify(error));
        return {};
      }
    },
    [extractPermissionsMapFromUnits],
  );

  const updatePermissionsInWorkspace = useCallback(async () => {
    if (!activeWorkspace?.id) {
      return {};
    }

    const unitIdToPermissionsMap = await fetchPermissionsInWorkspace(activeWorkspace?.id);

    setUnitPermissionsMap((prevState) => ({
      ...prevState,
      ...unitIdToPermissionsMap,
    }));

    return unitIdToPermissionsMap;
  }, [fetchPermissionsInWorkspace, activeWorkspace?.id]);

  const getUnitPermissionsAndUpdate = useCallback(
    async (unitId: string): Promise<Permission[]> => {
      const existingPermissions = unitPermissionsMap[unitId];

      if (existingPermissions) {
        return existingPermissions;
      }

      const fetchedPermissions = await fetchUnitItemPermissions(unitId);

      setUnitPermissionsMap((prevState) => ({
        ...prevState,
        [unitId]: fetchedPermissions,
      }));

      return fetchedPermissions;
    },
    [unitPermissionsMap, fetchUnitItemPermissions],
  );

  const getUnitPermissions = useCallback(
    (unitId: string) => {
      const permissionsForUnit = unitPermissionsMap[unitId] ?? [];
      return permissionsForUnit;
    },
    [unitPermissionsMap],
  );

  const getUnitsToShow = useCallback((units: Unit[]) => {
    const unitsToShow = units.filter((item) => item.permissions.includes(UNIT_PERMISSION_VIEW));

    return unitsToShow;
  }, []);

  const canDuplicateUnit = useCallback(
    (unitId: string) => {
      const permissions = getUnitPermissions(unitId);
      return permissions.includes(UNIT_PERMISSION_DUPLICATE);
    },
    [getUnitPermissions],
  );

  const canAddDoc = useCallback(
    (unitId: string) => {
      const permissions = getUnitPermissions(unitId);
      return permissions.includes(UNIT_PERMISSION_ADD_DOC);
    },
    [getUnitPermissions],
  );

  const canAddSubDoc = useCallback(
    (unitId: string) => {
      const permissions = getUnitPermissions(unitId);
      return permissions.includes(UNIT_PERMISSION_ADD_SUB_DOC);
    },
    [getUnitPermissions],
  );

  const canEditUnit = useCallback(
    (unitId: string) => {
      const permissions = getUnitPermissions(unitId);
      return permissions.includes(UNIT_PERMISSION_EDIT);
    },
    [getUnitPermissions],
  );

  // const canShareUnit = useCallback(
  //   (unitId: string) => {
  //     const permissions = getUnitPermissions(unitId);
  //     return permissions.includes(UNIT_PERMISSION_SHARE);
  //   },
  //   [getUnitPermissions],
  // );

  const canShareInviteUnit = useCallback(
    (unitId: string) => {
      const permissions = getUnitPermissions(unitId);
      return permissions.includes(UNIT_PERMISSION_SHARE_INVITE);
    },
    [getUnitPermissions],
  );

  const canShareInviteLinkUnit = useCallback(
    (unitId: string) => {
      const permissions = getUnitPermissions(unitId);
      return permissions.includes(UNIT_PERMISSION_SHARE_INVITE_LINK);
    },
    [getUnitPermissions],
  );

  const canDeleteUnit = useCallback(
    (unitId: string) => {
      const permissions = getUnitPermissions(unitId);
      return permissions.includes(UNIT_PERMISSION_DELETE);
    },
    [getUnitPermissions],
  );

  const canManageMembers = useCallback(
    (unitId: string) => {
      const permissions = getUnitPermissions(unitId);
      return permissions.includes(UNIT_PERMISSION_MANAGE_MEMBERS);
    },
    [getUnitPermissions],
  );

  const contextValue = useMemo(
    () => ({
      getUnitPermissionsAndUpdate,
      fetchUnitItemPermissions,
      updatePermissionsInWorkspace,
      getUnitPermissions,
      savePermissionsForUnits: extractPermissionsFromUnitsAndSave,
      getUnitsToShow,
      canDuplicateUnit,
      canAddDoc,
      canAddSubDoc,
      canEditUnit,
      // canShareUnit,
      canShareInviteUnit,
      canShareInviteLinkUnit,
      canDeleteUnit,
      canManageMembers,
    }),
    [
      fetchUnitItemPermissions,
      updatePermissionsInWorkspace,
      getUnitPermissionsAndUpdate,
      getUnitPermissions,
      extractPermissionsFromUnitsAndSave,
      getUnitsToShow,
      canDuplicateUnit,
      canAddDoc,
      canAddSubDoc,
      canEditUnit,
      // canShareUnit,
      canShareInviteUnit,
      canShareInviteLinkUnit,
      canDeleteUnit,
      canManageMembers,
    ],
  );

  return <PermissionsContext.Provider value={contextValue}>{children}</PermissionsContext.Provider>;
};

export const usePermissionsContext = () => {
  const context = useContext(PermissionsContext);

  if (typeof context === undefined) {
    throw new Error('usePermissionsContext must be used within PermissionsContextProvider');
  }

  return context;
};
