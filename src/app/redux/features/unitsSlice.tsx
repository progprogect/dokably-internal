import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Unit } from '@entities/models/unit';
import { compare2Units, renameUnit as renameUnitApi } from '@app/services/unit.service';

import type { RootState } from '../store';

export interface IUnitState {
  units: Unit[];
  deletedItems: Unit[];
}

const initialState: IUnitState = {
  units: [],
  deletedItems: [],
};

export const unitsSlice = createSlice({
  initialState,
  name: 'units',
  reducers: {
    setUnits: (state, action: PayloadAction<Unit[]>) => {
      state.units = action.payload;
    },
    setDeletedUnits: (state, action: PayloadAction<Unit[]>) => {
      state.deletedItems = action.payload;
    },
    updateUnit: (state, action: PayloadAction<Unit>) => {
      state.units = state.units.map((unit) => {
        if (unit.id === action.payload.id) {
          return action.payload;
        } else {
          return unit;
        }
      });
    },
    addUnit: (state, action: PayloadAction<Unit>) => {
      const newState = [...state.units];
      newState.unshift(action.payload);
      state.units = newState;
    },
    addUnitIfNotExistOrUpdate: (state, action: PayloadAction<Unit>) => {
      let newState = [...state.units];

      const savedItem = newState.find((x) => x.id === action.payload.id) as Unit;
      if (!savedItem) {
        newState.unshift(action.payload);
      } else {
        if (compare2Units(savedItem, action.payload)) {
          newState = newState.map((unit) => {
            if (unit.id === action.payload.id) {
              return action.payload;
            } else {
              return unit;
            }
          });
        }
      }
      state.units = newState;
    },
    addUnits: (state, action: PayloadAction<Unit[]>) => {
      const newState = [...state.units].concat(action.payload);
      state.units = newState;
    },
    removeUnit: (state, action: PayloadAction<Unit>) => {
      const newState = [...state.units].filter((unit) => unit.id !== action.payload.id);
      state.units = newState;
    },
    renameUnit: (state, action: PayloadAction<Unit>) => {
      state.units = state.units.map((unit) => {
        if (unit.id === action.payload.id) {
          return action.payload;
        } else {
          return unit;
        }
      });
      if (action.payload.id) {
        renameUnitApi(action.payload.id, action.payload.name);
      }
    },
    changeEmoji: (state, action: PayloadAction<{ id?: string; emoji: string | null }>) => {
      if (!action?.payload?.id) return;
      state.units = state.units.map((unit) => {
        if (unit.id === action.payload.id) {
          return { ...unit, emoji: action.payload.emoji };
        } else {
          return unit;
        }
      });
    },
  },
});

export default unitsSlice.reducer;

export const selectUnits = (state: RootState) => state.units;

export const {
  updateUnit,
  addUnit,
  addUnits,
  removeUnit,
  setUnits,
  renameUnit,
  changeEmoji,
  addUnitIfNotExistOrUpdate,
  setDeletedUnits,
} = unitsSlice.actions;
