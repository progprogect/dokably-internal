import {
  ASSIGNEE_PROPERTY_TYPE,
  CHECKBOX_PROPERTY_TYPE,
  DATE_PROPERTY_TYPE,
  DOC_LINKS_PROPERTY_TYPE,
  EMAIL_PROPERTY_TYPE,
  FILE_PROPERTY_TYPE,
  MULTISELECT_PROPERTY_TYPE,
  NUMBER_PROPERTY_TYPE,
  PropertyType,
  SELECT_PROPERTY_TYPE,
  STATUS_PROPERTY_TYPE,
  // TAG_PROPERTY_TYPE,
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
  TagIcon,
  TextIcon,
  TimerIcon,
  UserIcon,
} from 'lucide-react';
import { ReactElement } from 'react';

type Property = { name: string; type: PropertyType; icon: ReactElement };

export const columns: Property[] = [
  {
    name: 'Priority',
    type: SELECT_PROPERTY_TYPE,
    icon: <FlagIcon size={16} />,
  },
  {
    name: 'Assignee',
    type: ASSIGNEE_PROPERTY_TYPE,
    icon: <UserIcon size={16} />,
  },
  { name: 'Status', type: STATUS_PROPERTY_TYPE, icon: <StarIcon size={16} /> },
  { name: 'Date', type: DATE_PROPERTY_TYPE, icon: <TimerIcon size={16} /> },
  { name: 'Email', type: EMAIL_PROPERTY_TYPE, icon: <MailIcon size={16} /> },
  { name: 'Text', type: TEXT_PROPERTY_TYPE, icon: <TextIcon size={16} /> },
  { name: 'Number', type: NUMBER_PROPERTY_TYPE, icon: <HashIcon size={16} /> },
  {
    name: 'Checkbox',
    type: CHECKBOX_PROPERTY_TYPE,
    icon: <CheckSquareIcon size={16} />,
  },
  {
    name: 'Multiselect',
    type: MULTISELECT_PROPERTY_TYPE,
    icon: <ListIcon size={16} />,
  },
  { name: 'Url', type: URL_PROPERTY_TYPE, icon: <LinkIcon size={16} /> },
  {
    name: 'Doc links',
    type: DOC_LINKS_PROPERTY_TYPE,
    icon: <FileIcon size={16} />,
  },
  {
    name: 'Files and media',
    type: FILE_PROPERTY_TYPE,
    icon: <PaperclipIcon size={16} />,
  },
  // { name: 'Tags', type: TAG_PROPERTY_TYPE, icon: <TagIcon size={16} /> },
];
