import { ReactElement, ReactNode } from 'react';
import { ReactComponent as EyeClosed } from '@icons/eye-closed.svg';
import { ReactComponent as SortDesc } from '@icons/sort-descending.svg';
import { ReactComponent as SortAsc } from '@icons/sort-ascending.svg';
import { ReactComponent as TrashIcon } from '@icons/trash.svg';
import { ReactComponent as DuplicateIcon } from '@icons/duplicate-plus.svg';
import {
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
  TEXT_PROPERTY_TYPE,
  URL_PROPERTY_TYPE,
} from '@widgets/task-board/constants';
import {
  CheckSquareIcon,
  FileIcon,
  FlagIcon,
  HashIcon,
  LinkIcon,
  ListIcon,
  MailIcon,
  PaperclipIcon,
  StarIcon,
  TextIcon,
  TimerIcon,
  UserIcon,
} from 'lucide-react';

export enum MENU_ACTION {
  DUPLICATE = 'DUPLICATE',
  HIDE_IN_VIEW = 'HIDE_IN_VIEW',
  SEPARATOR = 'SEPARATOR',
  DELETE = 'DELETE',
  PROPERTY_TYPE = 'PROPERTY_TYPE',
  PROPERTY_TYPE_PRIORITY = 'PROPERTY_TYPE_PRIORITY',
  PROPERTY_TYPE_ASSIGNEE = 'PROPERTY_TYPE_ASSIGNEE',
  PROPERTY_TYPE_STATUS = 'PROPERTY_TYPE_STATUS',
  PROPERTY_TYPE_DUE_DATE = 'PROPERTY_TYPE_DUE_DATE',
  PROPERTY_TYPE_EMAIL = 'PROPERTY_TYPE_EMAIL',
  PROPERTY_TYPE_TEXT = 'PROPERTY_TYPE_TEXT',
  PROPERTY_TYPE_NUMBER = 'PROPERTY_TYPE_NUMBER',
  PROPERTY_TYPE_CHECKBOX = 'PROPERTY_TYPE_CHECKBOX',
  PROPERTY_TYPE_MULTISELECT = 'PROPERTY_TYPE_MULTISELECT',
  PROPERTY_TYPE_URL = 'PROPERTY_TYPE_URL',
  PROPERTY_TYPE_DOC_LINKS = 'PROPERTY_TYPE_DOC_LINKS',
  PROPERTY_TYPE_FILES = 'PROPERTY_TYPE_FILES',
  SORT_DESC = 'SORT_DESC',
  SORT_ASC = 'SORT_ASC',
}

export type MenuItemSub = {
  id: MENU_ACTION;
  icon: ReactElement | null;
  label?: ReactNode;
  sub: MenuItem[];
  type: 'sub';
};

export type MenuItemButton = {
  id: MENU_ACTION;
  icon: ReactElement | null;
  label: ReactNode;
  sub?: never;
  type?: 'button';
};

export type MenuItemSeparator = {
  id: MENU_ACTION;
  icon?: ReactElement | null;
  label?: ReactNode;
  sub?: never;
  type: 'separator';
};

export type Property = {
  id: string;
  name: string;
  type:
    | 'status'
    | 'select'
    | 'date'
    | 'assignee'
    | 'text'
    | 'number'
    | 'email'
    | 'checkbox'
    | 'multiselect'
    | 'url'
    | 'doc_link'
    | 'file';
  prohibitedActions?: Array<'delete' | 'change-property' | 'hide-in-preview'>;
};

export type MenuItem = MenuItemSub | MenuItemButton | MenuItemSeparator;

const MENU_ITEMS_MAP = {
  [MENU_ACTION.PROPERTY_TYPE_PRIORITY]: {
    id: MENU_ACTION.PROPERTY_TYPE_PRIORITY,
    icon: <FlagIcon size={16} />,
    label: 'Priority',
  },
  [MENU_ACTION.PROPERTY_TYPE_ASSIGNEE]: {
    id: MENU_ACTION.PROPERTY_TYPE_ASSIGNEE,
    icon: <UserIcon size={16} />,
    label: 'Assignee',
  },
  [MENU_ACTION.PROPERTY_TYPE_STATUS]: {
    id: MENU_ACTION.PROPERTY_TYPE_STATUS,
    icon: <StarIcon size={16} />,
    label: 'Status',
  },
  [MENU_ACTION.PROPERTY_TYPE_DUE_DATE]: {
    id: MENU_ACTION.PROPERTY_TYPE_DUE_DATE,
    icon: <TimerIcon size={16} />,
    label: 'Date',
  },
  [MENU_ACTION.PROPERTY_TYPE_EMAIL]: {
    id: MENU_ACTION.PROPERTY_TYPE_EMAIL,
    icon: <MailIcon size={16} />,
    label: 'Email',
  },
  [MENU_ACTION.PROPERTY_TYPE_TEXT]: {
    id: MENU_ACTION.PROPERTY_TYPE_TEXT,
    icon: <TextIcon size={16} />,
    label: 'Text',
  },
  [MENU_ACTION.PROPERTY_TYPE_NUMBER]: {
    id: MENU_ACTION.PROPERTY_TYPE_NUMBER,
    icon: <HashIcon size={16} />,
    label: 'Number',
  },
  [MENU_ACTION.PROPERTY_TYPE_CHECKBOX]: {
    id: MENU_ACTION.PROPERTY_TYPE_CHECKBOX,
    icon: <CheckSquareIcon size={16} />,
    label: 'Checkbox',
  },
  [MENU_ACTION.PROPERTY_TYPE_MULTISELECT]: {
    id: MENU_ACTION.PROPERTY_TYPE_MULTISELECT,
    icon: <ListIcon size={16} />,
    label: 'Multiselect',
  },
  [MENU_ACTION.PROPERTY_TYPE_URL]: {
    id: MENU_ACTION.PROPERTY_TYPE_URL,
    icon: <LinkIcon size={16} />,
    label: 'Url',
  },
  [MENU_ACTION.PROPERTY_TYPE_DOC_LINKS]: {
    id: MENU_ACTION.PROPERTY_TYPE_DOC_LINKS,
    icon: <FileIcon size={16} />,
    label: 'Doc links',
  },
  [MENU_ACTION.PROPERTY_TYPE_FILES]: {
    id: MENU_ACTION.PROPERTY_TYPE_FILES,
    icon: <PaperclipIcon size={16} />,
    label: 'Files',
  },
  [MENU_ACTION.HIDE_IN_VIEW]: {
    id: MENU_ACTION.HIDE_IN_VIEW,
    icon: <EyeClosed />,
    label: 'Hide in view',
  },
  [MENU_ACTION.DUPLICATE]: {
    id: MENU_ACTION.DUPLICATE,
    icon: <DuplicateIcon />,
    label: 'Duplicate',
  },
  [MENU_ACTION.DELETE]: {
    id: MENU_ACTION.DELETE,
    icon: <TrashIcon />,
    label: 'Delete',
  },
  [MENU_ACTION.SORT_DESC]: {
    id: MENU_ACTION.SORT_DESC,
    icon: <SortDesc />,
    label: 'Sort descending',
  },
  [MENU_ACTION.SORT_ASC]: {
    id: MENU_ACTION.SORT_ASC,
    icon: <SortAsc />,
    label: 'Sort ascending',
  },
  [MENU_ACTION.SEPARATOR]: {
    id: MENU_ACTION.SEPARATOR,
    icon: null,
    type: 'separator',
  },
  [MENU_ACTION.PROPERTY_TYPE]: {
    id: MENU_ACTION.PROPERTY_TYPE,
    sub: [],
    icon: null,
    label: 'Select property type',
    type: 'sub',
  },
} as const;

function makeMenuItemSubMenuItem(menuItemType: MENU_ACTION): MenuItemSub {
  return {
    ...MENU_ITEMS_MAP[menuItemType],
    sub: PROPERTY_TYPES_SUB_MENU_ITEMS,
    type: 'sub',
  };
}

export function getSubMenuItemByProperty(property: Property): MenuItemSub {
  switch (property.type) {
    case ASSIGNEE_PROPERTY_TYPE:
      return makeMenuItemSubMenuItem(MENU_ACTION.PROPERTY_TYPE_ASSIGNEE);
    case DATE_PROPERTY_TYPE:
      return makeMenuItemSubMenuItem(MENU_ACTION.PROPERTY_TYPE_DUE_DATE);
    case SELECT_PROPERTY_TYPE:
      return makeMenuItemSubMenuItem(MENU_ACTION.PROPERTY_TYPE_PRIORITY);
    case STATUS_PROPERTY_TYPE:
      return makeMenuItemSubMenuItem(MENU_ACTION.PROPERTY_TYPE_STATUS);
    case TEXT_PROPERTY_TYPE:
      return makeMenuItemSubMenuItem(MENU_ACTION.PROPERTY_TYPE_TEXT);
    case EMAIL_PROPERTY_TYPE:
      return makeMenuItemSubMenuItem(MENU_ACTION.PROPERTY_TYPE_EMAIL);
    case NUMBER_PROPERTY_TYPE:
      return makeMenuItemSubMenuItem(MENU_ACTION.PROPERTY_TYPE_NUMBER);
    case CHECKBOX_PROPERTY_TYPE:
      return makeMenuItemSubMenuItem(MENU_ACTION.PROPERTY_TYPE_CHECKBOX);
    case MULTISELECT_PROPERTY_TYPE:
      return makeMenuItemSubMenuItem(MENU_ACTION.PROPERTY_TYPE_MULTISELECT);
    case URL_PROPERTY_TYPE:
      return makeMenuItemSubMenuItem(MENU_ACTION.PROPERTY_TYPE_URL);
    case DOC_LINKS_PROPERTY_TYPE:
      return makeMenuItemSubMenuItem(MENU_ACTION.PROPERTY_TYPE_DOC_LINKS);
    case FILE_PROPERTY_TYPE:
      return makeMenuItemSubMenuItem(MENU_ACTION.PROPERTY_TYPE_FILES);
    default:
      return makeMenuItemSubMenuItem(MENU_ACTION.PROPERTY_TYPE);
  }
}

const PROPERTY_TYPES_SUB_MENU_ITEMS: MenuItem[] = [
  MENU_ITEMS_MAP[MENU_ACTION.PROPERTY_TYPE_PRIORITY],
  MENU_ITEMS_MAP[MENU_ACTION.PROPERTY_TYPE_ASSIGNEE],
  MENU_ITEMS_MAP[MENU_ACTION.PROPERTY_TYPE_STATUS],
  MENU_ITEMS_MAP[MENU_ACTION.PROPERTY_TYPE_DUE_DATE],
  MENU_ITEMS_MAP[MENU_ACTION.PROPERTY_TYPE_EMAIL],
  MENU_ITEMS_MAP[MENU_ACTION.PROPERTY_TYPE_TEXT],
  MENU_ITEMS_MAP[MENU_ACTION.PROPERTY_TYPE_NUMBER],
  MENU_ITEMS_MAP[MENU_ACTION.PROPERTY_TYPE_CHECKBOX],
  MENU_ITEMS_MAP[MENU_ACTION.PROPERTY_TYPE_MULTISELECT],
  MENU_ITEMS_MAP[MENU_ACTION.PROPERTY_TYPE_URL],
  MENU_ITEMS_MAP[MENU_ACTION.PROPERTY_TYPE_DOC_LINKS],
  MENU_ITEMS_MAP[MENU_ACTION.PROPERTY_TYPE_FILES],
];

export const PROPERTY_TYPE_NON_SELECTED: MenuItem = makeMenuItemSubMenuItem(MENU_ACTION.PROPERTY_TYPE);

export const HIDE_IN_VIEW_MENU_ITEM: MenuItem = MENU_ITEMS_MAP[MENU_ACTION.HIDE_IN_VIEW];
export const SEPARATOR_MENU_ITEM: MenuItem = MENU_ITEMS_MAP[MENU_ACTION.SEPARATOR];

export const COMMON_MENU_ITEMS: MenuItem[] = [
  MENU_ITEMS_MAP[MENU_ACTION.DUPLICATE],
  MENU_ITEMS_MAP[MENU_ACTION.DELETE],
];

export const SORTABLE_MENU_ITEMS: MenuItem[] = [
  MENU_ITEMS_MAP[MENU_ACTION.SORT_DESC],
  MENU_ITEMS_MAP[MENU_ACTION.SORT_ASC],
];
