import update from 'immutability-helper';
import { ActionTypes, DataTypes, shortId } from './utils';
import { State, Action, TableColumn, Sorting, Option, TableRow } from './Table.types';
import { useReducer } from 'react';

export const defaultColumns = [
  {
    id: shortId('col'),
    label: 'Column 1',
    size: 100,
    dataType: DataTypes.TEXT,
    options: [],
  },
  {
    id: shortId('col'),
    label: 'Column 2',
    size: 100,
    dataType: DataTypes.TEXT,
    options: [],
  },
  {
    id: shortId('col'),
    label: 'Column 3',
    size: 100,
    dataType: DataTypes.TEXT,
    options: [],
  },
];

export const defaultData = [
  { id: shortId('row'), ...defaultColumns.reduce((acc, col) => ({ ...acc, [col.id]: null }), {}) },
  { id: shortId('row'), ...defaultColumns.reduce((acc, col) => ({ ...acc, [col.id]: null }), {}) },
  { id: shortId('row'), ...defaultColumns.reduce((acc, col) => ({ ...acc, [col.id]: null }), {}) },
];

export function reducer(state: State, action: Action): State {
  const findColumnIndex = (columnId: string) => state.columns.findIndex((column) => column.id === columnId);

  switch (action.type) {
    case ActionTypes.UPDATE_COLUMN_ORDER:
      const { columnOrder } = action;
      const newColumns = columnOrder
        .map((colId: string) => state.columns.find((column) => column.id === colId))
        .filter(Boolean) as Array<TableColumn>;

      return update(state, {
        columns: { $set: newColumns },
      });

    case ActionTypes.UPDATE_OPTIONS: {
      const { columnId, options } = action;
      const columnIndex = findColumnIndex(columnId);

      if (columnIndex === -1) return state;
      return update(state, {
        columns: {
          [columnIndex]: {
            options: {
              $set: options,
            },
          },
        },
      });
    }

    case ActionTypes.ADD_ROW: {
      const newRow = {
        id: shortId('row'),
        ...state.columns.reduce((acc, col) => ({ ...acc, [col.id]: null }), {}),
      };
      return update(state, {
        data: { $push: [newRow] },
      });
    }

    case ActionTypes.UPDATE_COLUMN_TYPE: {
      const columnIndex = findColumnIndex(action.columnId);
      if (columnIndex === -1 || state.columns[columnIndex].dataType === action.dataType) return state;
      let options: Option[] = [];

      if (action.dataType === DataTypes.PRIORITY) {
        options = [
          { id: shortId('opt'), label: 'None', color: '#A9A9AB' },
          { id: shortId('opt'), label: 'Low', color: '#65D7A0' },
          { id: shortId('opt'), label: 'Medium', color: '#FFD646' },
          { id: shortId('opt'), label: 'High', color: '#FF5065' },
        ];
      }

      if (action.dataType === DataTypes.STATUS) {
        options = [
          { id: shortId('opt'), label: 'To do', color: '#A9A9AB' },
          { id: shortId('opt'), label: 'In progress', color: '#4A86FF' },
          { id: shortId('opt'), label: 'Done', color: '#65D7A0' },
        ];
      }

      const updates = {
        columns: {
          [columnIndex]: {
            dataType: { $set: action.dataType },
            options: { $set: options },
          },
        },
        data: {
          $set: state.data.map((row) => ({ ...row, [action.columnId]: null })),
        },
      };

      return update(state, updates);
    }

    case ActionTypes.UPDATE_COLUMN_HEADER: {
      const columnIndex = findColumnIndex(action.columnId);
      if (columnIndex === -1) return state;

      return update(state, {
        columns: { [columnIndex]: { label: { $set: action.label } } },
      });
    }

    case ActionTypes.UPDATE_CELL: {
      return update(state, {
        data: {
          [action.rowIndex]: { [action.columnId]: { $set: action.value } },
        },
      });
    }

    case ActionTypes.ADD_COLUMN_TO_LEFT:
    case ActionTypes.ADD_COLUMN_TO_RIGHT: {
      const columnIndex = findColumnIndex(action.columnId);
      const newColumnId = shortId('col');
      const newColumn: TableColumn = {
        id: newColumnId,
        label: 'Column',
        size: 100,
        dataType: DataTypes.TEXT,
        options: [],
      };

      const position = action.type === ActionTypes.ADD_COLUMN_TO_LEFT ? columnIndex : columnIndex + 1;
      return update(state, {
        columns: {
          $splice: [[position, 0, newColumn]],
        },
        lastAddedColumnId: { $set: newColumnId },
      });
    }

    case ActionTypes.ADD_COLUMN_TO_END: {
      const newColumnId = shortId('col');
      const newColumn: TableColumn = {
        id: newColumnId,
        label: 'Column',
        size: 100,
        dataType: DataTypes.TEXT,
        options: [],
      };

      return update(state, {
        columns: {
          $push: [newColumn],
        },
        lastAddedColumnId: { $set: newColumnId },
      });
    }

    case ActionTypes.DUPLICATE_COLUMN: {
      const columnIndex = findColumnIndex(action.columnId);
      const currentColumn = state.columns[columnIndex];
      const newColumnId = shortId('col');
      const newColumn: TableColumn = { ...currentColumn, id: newColumnId };
      const newData = state.data.map((item) => ({
        ...item,
        [newColumnId]: item[currentColumn.id],
      }));
      const position = columnIndex + 1;
      
      return update(state, {
        data: { $set: newData.filter(Boolean) as TableRow[] },
        columns: {
          $splice: [[position, 0, newColumn]],
        },
        lastAddedColumnId: { $set: newColumnId },
      });
    }

    case ActionTypes.DELETE_COLUMN: {
      const columnIndex = findColumnIndex(action.columnId);
      if (columnIndex === -1) return state;

      return update(state, {
        columns: { $splice: [[columnIndex, 1]] },
        data: {
          $apply: (rows: TableRow[]) => rows.map((row) => update(row, { $unset: [action.columnId] })),
        },
      });
    }

    case ActionTypes.DUPLICATE_ROW: {
      const newData = [...state.data];
      const duplicateRowIndex = Number(action.rowId);
      const duplicatedItem = {
        ...state.data[duplicateRowIndex],
        id: shortId('row'),
      };
      newData.splice(duplicateRowIndex + 1, 0, duplicatedItem);
      return update(state, {
        data: { $set: newData.filter((row): row is TableRow => row !== undefined) },
      });
    }

    case ActionTypes.DELETE_ROW: {
      const deleteRowIndex = Number(action.rowId);
      return update(state, {
        data: { $splice: [[deleteRowIndex, 1]] },
      });
    }

    case ActionTypes.ADD_ROW_ABOVE:
    case ActionTypes.ADD_ROW_BELOW: {
      const rowIndex = Number(action.rowId);
      const newRow = {
        id: shortId('row'),
        ...state.columns.reduce((acc, col) => ({ ...acc, [col.id]: null }), {}),
      };
      const position = action.type === ActionTypes.ADD_ROW_ABOVE ? rowIndex : rowIndex + 1;

      return update(state, {
        data: { $splice: [[position, 0, newRow]] },
      });
    }

    case ActionTypes.UPDATE_ROW_ORDER: {
      const { rowOrder } = action;
      const newData = rowOrder.map((rowId: string) => state.data.find((row) => row.id === rowId)).filter(Boolean);

      // Создаем новый объект состояния вручную
      return {
        ...state,
        data: newData.filter(Boolean) as TableRow[],
        sorting: []
      };
    }

    case ActionTypes.UPDATE_SORTING_BY_COLUMN: {
      const { columnId, sortType } = action;
      let newSorting: Array<Sorting>;

      switch (sortType) {
        case 'asc':
          newSorting = [{ id: columnId, desc: false }];
          break;
        case 'desc':
          newSorting = [{ id: columnId, desc: true }];
          break;
        case 'none':
          newSorting = [];
          break;
        default:
          console.warn(`Unknown sort type: ${sortType}`);
          return state;
      }

      return update(state, {
        sorting: { $set: newSorting },
      });
    }

    case ActionTypes.UPDATE_COLUMN_SIZE: {
      const columnIndex = findColumnIndex(action.columnId);
      if (columnIndex === -1) return state;

      return update(state, {
        columns: {
          [columnIndex]: {
            size: { $set: action.size },
          },
        },
      });
    }

    case ActionTypes.SET_SORTING: {
      return update(state, {
        sorting: { $set: action.sorting },
      });
    }

    case ActionTypes.SET_LAST_ADDED_COLUMN_ID:
      return update(state, {
        lastAddedColumnId: { $set: action.columnId },
      });

    default:
      return state;
  }
}

export const useTableReducer = (incomeState: State): [State, React.Dispatch<Action>] => {
  const initialState = {
    columns: incomeState.columns || defaultColumns,
    data: incomeState.data || defaultData,
    sorting: incomeState.sorting || [],
    lastAddedColumnId: incomeState.lastAddedColumnId || null,
  };
  return useReducer(reducer, initialState);
};
