import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@amplitude/analytics-browser';
import toast from 'react-hot-toast';

import { duplicate, getDeletedUnits, getUnits } from '@app/services/unit.service';
import { Unit } from '@entities/models/unit';
import {
  addUnit as addUnitContext,
  selectUnits,
  setDeletedUnits,
  setUnits as setUnitsContext,
} from '@app/redux/features/unitsSlice';
import { successToastOptions } from '@shared/common/Toast';

import { useWorkspaceContext } from '../workspace/context';
import { useChannelsContext } from '../channelsContext/channelsContext';
import { usePermissionsContext } from '../permissionsContext/permissionsContext';

type AddUnit = (unit: Unit) => Promise<void>;

type DuplicateUnit = (existingUnit: Unit) => Promise<Unit>;

export type UnitsContextValueType = {
  units: Unit[];
  addUnit: AddUnit;
  deletedUnits: Unit[];
  duplicateUnit: DuplicateUnit;
};

const UnitsContext = createContext<UnitsContextValueType>({
  units: [],
  addUnit: async () => {},
  deletedUnits: [],
  duplicateUnit: async () => {},
} as unknown as UnitsContextValueType);

export const UnitsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { getUnitPermissionsAndUpdate, savePermissionsForUnits, getUnitsToShow } = usePermissionsContext();

  const { activeWorkspace } = useWorkspaceContext();
  const { channels, didChannelsLoaded, defaultChannel } = useChannelsContext();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (!activeWorkspace?.id || !didChannelsLoaded) return;

      const downloadedUnits = await getUnits(activeWorkspace.id);
      savePermissionsForUnits(downloadedUnits);
      const _units = getUnitsToShow(downloadedUnits);

      const defChannel =
        defaultChannel ||
        _units.find((unit) => unit.type === 'channel' && unit.name.toLowerCase() === 'private') ||
        _units.filter((unit) => unit.type === 'channel')[0];

      let deletedUnits = await getDeletedUnits(activeWorkspace.id);

      dispatch(setDeletedUnits(deletedUnits));

      if (defChannel) {
        const tempDefaultChannel = _units.find((unit: Unit) => unit.id === defChannel.id);
        if (tempDefaultChannel) {
          tempDefaultChannel.isDefault = true;
        }
        _units.sort((unit: Unit) => (unit.isDefault ? 1 : -1));
      }

      _units.sort((a, b) => {
        let c = a.createdAt ? new Date(a.createdAt) : new Date();
        let d = b.createdAt ? new Date(b.createdAt) : new Date();
        return d.getTime() - c.getTime();
      });

      dispatch(setUnitsContext(_units));
    };

    fetchData();
  }, [activeWorkspace?.id, didChannelsLoaded, defaultChannel]);

  const addUnit: AddUnit = useCallback(async (unit) => {
    await getUnitPermissionsAndUpdate(unit.id);

    dispatch(addUnitContext(unit));
  }, []);

  const duplicateUnit: DuplicateUnit = useCallback(async (existingUnit) => {
    const newItem = await duplicate(existingUnit.id);
    await getUnitPermissionsAndUpdate(newItem.id);

    dispatch(addUnitContext(newItem));
    track(`${existingUnit.type}_duplicate_action`);

    toast.success(`Duplicate ${existingUnit.type} ${existingUnit.name} created`, successToastOptions);

    return newItem;
  }, []);

  const units = useSelector(selectUnits).units;
  const deletedUnits = useSelector(selectUnits).deletedItems;

  const contextValue = useMemo(
    () => ({
      units,
      addUnit,
      deletedUnits,
      duplicateUnit,
    }),
    [addUnit, units, deletedUnits, duplicateUnit],
  );

  return <UnitsContext.Provider value={contextValue}>{children}</UnitsContext.Provider>;
};

export const useUnitsContext = () => {
  const context = useContext(UnitsContext);

  if (typeof context === undefined) {
    throw new Error('useUsersContext must be used within UsersContextProvider');
  }

  return context;
};
