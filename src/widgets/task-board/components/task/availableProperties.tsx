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
  TASK_ASSIGNEE_PROPERTY,
  TASK_CHECKBOX_PROPERTY,
  TASK_DATE_PROPERTY,
  TASK_DOC_LINKS_PROPERTY,
  TASK_EMAIL_PROPERTY,
  TASK_FILES_PROPERTY,
  TASK_MULTISELECT_PROPERTY,
  TASK_NUMBER_PROPERTY,
  TASK_PRIORITY_PROPERTY,
  TASK_STATUS_PROPERTY,
  TASK_TEXT_PROPERTY,
  TASK_URL_PROPERTY,
  TEXT_PROPERTY_TYPE,
  URL_PROPERTY_TYPE,
} from '@widgets/task-board/constants';
import { AvailablePropertiesProps } from './TaskInformation';
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
import { TaskPriorityProperty } from '../properties/priority/task-priority-property';
import { TaskAssignProperty } from '../properties/assignee/task-assign-property';
import { TaskStatusProperty } from '../properties/status/task-status-property';
import { TaskDocLinksProperty } from '../properties/docLinks/task-docLinks-property';
import { TaskFilesProperty } from '../properties/files/task-files-property';
import { TaskMultiselectProperty } from '../properties/multiselect/task-multiselect-property';
import { TaskUrlProperty } from '../properties/url/task-url-property';
import { TaskCheckboxProperty } from '../properties/checkbox/task-checkbox-property';
import { TaskNumberProperty } from '../properties/number/task-number-property';
import { TaskTextProperty } from '../properties/text/task-text-property';
import { TaskEmailProperty } from '../properties/email/task-email-property';
import { TaskDateProperty } from '../properties/date/task-date-property';

const availableProperties: AvailablePropertiesProps[] = [
  {
    type: SELECT_PROPERTY_TYPE,
    title: TASK_PRIORITY_PROPERTY,
    icon: <FlagIcon size={16} />,
    component: (task, _0, refetch) => (
      <TaskPriorityProperty
        task={task}
        size='lg'
        className='hover:bg-[transparent] px-[0px] [&>svg]:mr-[3px] text-[14px] text-[#29282C]'
        refetch={refetch}
      />
    ),
  },
  {
    type: ASSIGNEE_PROPERTY_TYPE,
    title: TASK_ASSIGNEE_PROPERTY,
    icon: <UserIcon size={16} />,
    component: (task, _0, refetch) => (
      <TaskAssignProperty
        task={task}
        size='lg'
        className='group hover:bg-[transparent] [&>button>div]:px-[0px]'
        iconClassName='opacity-0 group-hover:opacity-100'
        refetch={refetch}
      />
    ),
  },
  {
    type: STATUS_PROPERTY_TYPE,
    title: TASK_STATUS_PROPERTY,
    icon: <StarIcon size={16} />,
    component: (task, _0, refetch) => (
      <TaskStatusProperty
        task={task}
        size='lg'
        refetch={refetch}
      />
    ),
  },
  {
    type: DATE_PROPERTY_TYPE,
    title: TASK_DATE_PROPERTY,
    icon: <TimerIcon size={16} />,
    component: (task, property, refetch) => (
      <TaskDateProperty
        task={task}
        property={property}
        refetch={refetch}
      />
    ),
  },
  {
    type: EMAIL_PROPERTY_TYPE,
    title: TASK_EMAIL_PROPERTY,
    icon: <MailIcon size={16} />,
    component: (task, property, refetch) => (
      <TaskEmailProperty
        task={task}
        property={property}
        refetch={refetch}
      />
    ),
  },
  {
    type: TEXT_PROPERTY_TYPE,
    title: TASK_TEXT_PROPERTY,
    icon: <TextIcon size={16} />,
    component: (task, property, refetch) => (
      <TaskTextProperty
        task={task}
        property={property}
        refetch={refetch}
      />
    ),
  },
  {
    type: NUMBER_PROPERTY_TYPE,
    title: TASK_NUMBER_PROPERTY,
    icon: <HashIcon size={16} />,
    component: (task, property, refetch) => (
      <TaskNumberProperty
        task={task}
        property={property}
        size='lg'
        refetch={refetch}
      />
    ),
  },
  {
    type: CHECKBOX_PROPERTY_TYPE,
    title: TASK_CHECKBOX_PROPERTY,
    icon: <CheckSquareIcon size={16} />,
    component: (task, property, refetch) => (
      <TaskCheckboxProperty
        task={task}
        property={property}
        refetch={refetch}
      />
    ),
  },
  {
    type: URL_PROPERTY_TYPE,
    title: TASK_URL_PROPERTY,
    icon: <LinkIcon size={16} />,
    component: (task, property, refetch) => (
      <TaskUrlProperty
        task={task}
        property={property}
        refetch={refetch}
      />
    ),
  },
  {
    type: MULTISELECT_PROPERTY_TYPE,
    title: TASK_MULTISELECT_PROPERTY,
    icon: <ListIcon size={16} />,
    component: (task, property, refetch) => (
      <TaskMultiselectProperty
        task={task}
        property={property}
        refetch={refetch}
      />
    ),
  },
  {
    type: DOC_LINKS_PROPERTY_TYPE,
    title: TASK_DOC_LINKS_PROPERTY,
    icon: <FileIcon size={16} />,
    component: (task, property, refetch) => (
      <TaskDocLinksProperty
        task={task}
        property={property}
        refetch={refetch}
      />
    ),
  },
  {
    type: FILE_PROPERTY_TYPE,
    title: TASK_FILES_PROPERTY,
    icon: <PaperclipIcon size={16} />,
    component: (task, property, refetch) => (
      <TaskFilesProperty
        task={task}
        property={property}
        refetch={refetch}
      />
    ),
  },
];

export default availableProperties;
