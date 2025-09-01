export const PRIORITIES = [
  { value: 0, name: 'None', color: '#A9A9AB' },
  { value: 1, name: 'Low', color: '#FFD646' },
  { value: 2, name: 'Medium', color: '#65D7A0' },
  { value: 3, name: 'High', color: '#FF5065' },
];

export type COLORS =
  | '#daf4e7'
  | '#d1e0ff'
  | '#ddf7eb'
  | '#fff7b3'
  | '#ffd4be'
  | '#ffdce0'
  | '#d4d4d5'
  | '#ffffff'
  | '#fde4bf'
  | '#dfe9ff'
  | string;

export const COLORS_LIST = [
  '#d4d4d5',
  '#daf4e7',
  '#d1e0ff',
  '#ddf7eb',
  '#fff7b3',
  '#ffd4be',
  '#ffdce0',
  '#ffffff',
  '#fde4bf',
  '#dfe9ff',
];

export const TASK_PRIORITY_PROPERTY = 'Priority';
export const TASK_ASSIGNEE_PROPERTY = 'Assign';
export const TASK_STATUS_PROPERTY = 'Status';
export const TASK_DATE_PROPERTY = 'Due date';
export const TASK_EMAIL_PROPERTY = 'Email';
export const TASK_TEXT_PROPERTY = 'Text';
export const TASK_NUMBER_PROPERTY = 'Number';
export const TASK_CHECKBOX_PROPERTY = 'Checkbox';
export const TASK_MULTISELECT_PROPERTY = 'Multiselect';
export const TASK_URL_PROPERTY = 'Url';
export const TASK_DOC_LINKS_PROPERTY = 'DocLinks';
export const TASK_FILES_PROPERTY = 'Files';
export const TASK_LABELS_PROPERTY = 'Labels';
export const TASK_TAG_PROPERTY = 'Tag';

export const SELECT_PROPERTY_TYPE = 'select';
export const ASSIGNEE_PROPERTY_TYPE = 'assignee';
export const STATUS_PROPERTY_TYPE = 'status';
export const EMAIL_PROPERTY_TYPE = 'email';
export const DATE_PROPERTY_TYPE = 'date';
export const TEXT_PROPERTY_TYPE = 'text';
export const NUMBER_PROPERTY_TYPE = 'number';
export const CHECKBOX_PROPERTY_TYPE = 'checkbox';
export const MULTISELECT_PROPERTY_TYPE = 'multiselect';
export const URL_PROPERTY_TYPE = 'url';
export const DOC_LINKS_PROPERTY_TYPE = 'doc_link';
export const FILE_PROPERTY_TYPE = 'file';
export const TAG_PROPERTY_TYPE = 'tag';

const propertyTypes = [
  ASSIGNEE_PROPERTY_TYPE,
  CHECKBOX_PROPERTY_TYPE,
  DATE_PROPERTY_TYPE,
  DOC_LINKS_PROPERTY_TYPE,
  EMAIL_PROPERTY_TYPE,
  FILE_PROPERTY_TYPE,
  MULTISELECT_PROPERTY_TYPE,
  NUMBER_PROPERTY_TYPE,
  SELECT_PROPERTY_TYPE,
  STATUS_PROPERTY_TYPE,
  TAG_PROPERTY_TYPE,
  TEXT_PROPERTY_TYPE,
  URL_PROPERTY_TYPE,
] as const;

export type PropertyType = (typeof propertyTypes)[number];
