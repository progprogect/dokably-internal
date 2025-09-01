import { track } from '@amplitude/analytics-browser';
import { BASE_API } from '@app/constants/endpoints';
import { Unit } from '@entities/models/unit';
import customFetch from '@app/utils/customFetch';
import { Permission } from '@entities/models/unitPermissions';

export const getUnits = async (workspaceId: string): Promise<Unit[]> => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/workspace/${workspaceId}/unit`,
  );
  return await rawResponse.json();
};

type GetUnitPermissionResult = {
  id: string;
  permissions: Permission[];
};

export const getUnitPermission = async (
  unitId: string,
): Promise<GetUnitPermissionResult> => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/unit/${unitId}/permission`,
  );
  const result = await rawResponse.json();

  return {
    id: unitId,
    permissions: result.permissions,
  };
};

export const getUnitChilds = async (
  unitId: string,
  workspaceId: string,
): Promise<Unit[]> => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/workspace/${workspaceId}/unit/${unitId}/unit`,
  );
  return await rawResponse.json();
};

export const getUnit = async (
  unitId: string,
  workspaceId: string,
  options?: { signal?: AbortSignal },
): Promise<Unit | null> => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/workspace/${workspaceId}/unit/${unitId}`,
    options,
  );
  if (rawResponse.ok) {
    return await rawResponse.json();
  } else {
    return null;
  }
};

export const deleteUnit = async (id: string) => {
  await customFetch(`${BASE_API}/frontend/unit/${id}`, {
    method: 'DELETE',
  });
};

export const renameUnit = async (id: string, title: string) => {
  track('document_name_changed');
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/unit/${id}/title`,
    {
      method: 'PATCH',
      body: JSON.stringify({ title: title }),
    },
  );
  return await rawResponse.json();
};

export const updateUnitAccess = async (id: string, access: string) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/unit/${id}/title`,
    {
      method: 'PATCH',
      body: JSON.stringify({ access: access }),
    },
  );
  return await rawResponse.json();
};

export const compare2Units = (unit1: Unit, unit2: Unit): boolean => {
  let result = true;

  if (unit1.id !== unit2.id) result = false;
  if (unit1.color !== unit2.color) result = false;
  if (unit1.isDefault !== unit2.isDefault) result = false;
  if (unit1.name !== unit2.name) result = false;
  if (unit1.parentUnit !== unit2.parentUnit) result = false;
  if (unit1.type !== unit2.type) result = false;

  return result;
};

export const duplicate = async (unitId: string): Promise<Unit> => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/unit/${unitId}/duplicate`,
    {
      method: 'POST',
    },
  );
  return await rawResponse.json();
};

export const getChilds = async (
  id: string,
  workspaceId: string,
): Promise<Unit[]> => {
  let result = await getUnitChilds(id, workspaceId);
  let temp = result;
  if (temp.length > 0) {
    for (let i = 0; i < temp.length; i++) {
      let childs = await getChilds(temp[i].id, workspaceId);
      result = [...result, ...childs];
    }
    return result;
  } else {
    return result;
  }
};

export const getDeletedUnits = async (workspaceId: string): Promise<Unit[]> => {
  return await customFetch(
    `${BASE_API}/frontend/workspace/${workspaceId}/trash`,
  ).then((resp) => resp.json());
};

export const getBreadCrumbs = (
  unit: Unit,
  path: string,
  units: Unit[],
): string => {
  if (unit.parentUnit && unit.parentUnit.id) {
    const parrentUnit = units.find((u) => u.id === unit.parentUnit?.id);
    if (parrentUnit) {
      path = `${parrentUnit.name} / ${path}`;
      return getBreadCrumbs(parrentUnit, path, units);
    }
  }
  return path;
};
