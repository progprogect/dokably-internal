export function shortId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

export function randomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 95%, 90%)`;
}

export const ActionTypes = Object.freeze({
  UPDATE_COLUMN_ORDER: 'update_column_order',
  ADD_ROW: 'add_row',
  UPDATE_COLUMN_TYPE: 'update_column_type',
  UPDATE_COLUMN_HEADER: 'update_column_header',
  UPDATE_CELL: 'update_cell',
  ADD_COLUMN_TO_LEFT: 'add_column_to_left',
  ADD_COLUMN_TO_RIGHT: 'add_column_to_right',
  ADD_COLUMN_TO_END: 'add_column_to_end',
  DUPLICATE_COLUMN: 'duplicate_column',
  DELETE_COLUMN: 'delete_column',
  DELETE_ROW: 'delete_row',
  ADD_ROW_ABOVE: 'add_row_above',
  ADD_ROW_BELOW: 'add_row_below',
  UPDATE_OPTIONS: 'update_options',
  UPDATE_ROW_ORDER: 'update_row_order',
  UPDATE_SORTING_BY_COLUMN: 'update_sorting_by_column',
  SET_SORTING: 'set_sorting',
  UPDATE_COLUMN_SIZE: 'update_column_size',
  SET_HEADER_ROW: 'set_header_row',
  MERGE_CELLS_ROW: 'merge_cells_row',
  DUPLICATE_ROW: 'duplicate_row',
  SET_LAST_ADDED_COLUMN_ID: 'set_last_added_column_id',
} as const);

export enum DataTypes {
  NUMBER = 'number',
  // NUMBER_WITH_COMMAS = 'number-with-commas',
  // PERCENT = 'percent',
  // EURO = 'euro',
  // US_DOLLAR = 'us-dollar',
  // POUND = 'pound',
  TEXT = 'text',
  SELECT = 'Multi-select',
  DUE_DATE = 'date',
  ASSIGNEE = 'assignee',
  PRIORITY = 'priority',
  STATUS = 'status',
  EMAIL = 'email',
  CHECKBOX = 'checkbox',
  URL = 'url',
  DOC_LINKS = 'docLinks',
  FILES_AND_MEDIA = 'filesAndMedia',
}

export enum DataNumberTypes {
  NUMBER = 'number',
  // NUMBER_WITH_COMMAS = 'number-with-commas',
  PERCENT = 'percent',
  EURO = 'euro',
  US_DOLLAR = 'us-dollar',
  POUND = 'pound',
}

export const Constants = Object.freeze({
  ADD_COLUMN_ID: '999999',
});
