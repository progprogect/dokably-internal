import { ActionTypes } from './utils';

export interface TableRow {
  id: string;
  [key: string]: any;
}

export interface TableColumn {
  id: string;
  label: string;
  dataType: string;
  size: number;
  options: Option[];
}

export interface Sorting {
  id: string;
  desc: boolean;
}

export interface State {
  columns: Array<TableColumn>;
  data: Array<TableRow>;
  sorting: Sorting[];
  lastAddedColumnId: string | null;
}

export interface Option {
  id: string;
  label: string;
  color: string;
  email?: string;
}

type ActionType = (typeof ActionTypes)[keyof typeof ActionTypes];

interface BaseAction {
  type: string;
  [key: string]: any;
}

export interface ColumnAction extends BaseAction {
  columnId: string;
  focus?: boolean;
  callbackRef?: {
    newColumnId?: string;
  };
}

export interface RowAction extends BaseAction {
  rowId: string;
}

export type Action =
  | { type: 'update_column_order'; columnOrder: string[] }
  | { type: 'update_row_order'; rowOrder: string[] }
  | { type: 'add_row' }
  | (RowAction & { type: 'add_row_above' | 'add_row_below' | 'duplicate_row' | 'delete_row' })
  | { type: 'set_sorting'; sorting: Sorting[] }
  | { type: 'update_sorting_by_column'; columnId: string; sortType: 'asc' | 'desc' | 'none' }
  | (ColumnAction &
      (
        | { type: 'update_options'; options: Option[] }
        | { type: 'update_column_type'; dataType: string }
        | { type: 'update_column_header'; label: string }
        | { type: 'update_cell'; rowIndex: number; value: any }
        | { type: 'add_column_to_left' | 'add_column_to_right' | 'duplicate_column' | 'delete_column' }
        | { type: 'update_column_size'; size: number }
        | { type: 'set_last_added_column_id' }
      ))
  | { type: 'add_column_to_end'; callbackRef?: { newColumnId?: string } };
