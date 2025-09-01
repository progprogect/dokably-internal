import { useEditTaskSelectProperty } from '@app/queries/property/select/useEditTaskSelectProperty';
import { useTaskPriorityProperty } from '../../properties/priority/use-task-priority-property';
import { useTaskStatusProperty } from '../../properties/status/use-task-status-property';
import { useEditTaskStatusProperty } from '@app/queries/property/status/useEditTaskStatusProperty';
import { useCreateAssigneeProperty } from '@app/queries/property/assign/useCreateAssigneeProperty';
import { useEditAssigneeProperty } from '@app/queries/property/assign/useEditAssigneeProperty';
import { useCreateDateProperty } from '@app/queries/property/date/useCreateDateProperty';
import { useEditTaskDateProperty } from '@app/queries/property/date/useEditTaskDateProperty';
import { useCreateEmailProperty } from '@app/queries/property/email/useCreateEmailProperty';
import { useEditEmailProperty } from '@app/queries/property/email/useEditEmailProperty';
import { useCreateTextProperty } from '@app/queries/property/text/useCreateTextProperty';
import { useEditTextProperty } from '@app/queries/property/text/useEditTextProperty';
import { useCreateNumberProperty } from '@app/queries/property/number/useCreateNumberProperty';
import { useEditNumberProperty } from '@app/queries/property/number/useEditNumberProperty';
import { useCreateCheckboxProperty } from '@app/queries/property/checkbox/useCreateCheckboxProperty';
import { useEditCheckboxProperty } from '@app/queries/property/checkbox/useEditCheckboxProperty';
import { useCreateMultiselectProperty } from '@app/queries/property/multiselect/useCreateMultiselectProperty';
import { useEditMultiselectProperty } from '@app/queries/property/multiselect/useEditTaskMultiselectProperty';
import { useCreateUrlProperty } from '@app/queries/property/url/useCreateUrlProperty';
import { useEditUrlProperty } from '@app/queries/property/url/useEditUrlProperty';
import { useCreateDocLinksProperty } from '@app/queries/property/docLinks/useCreateDocLinksProperty';
import { useEditDocLinksProperty } from '@app/queries/property/docLinks/useEditTaskDocLinksProperty';
import { useCreateFilesProperty } from '@app/queries/property/files/useCreateFilesProperty';
import { useEditFilesProperty } from '@app/queries/property/files/useEditFilesProperty';
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
  TASK_TEXT_PROPERTY,
  TASK_URL_PROPERTY,
  TEXT_PROPERTY_TYPE,
  URL_PROPERTY_TYPE,
} from '@widgets/task-board/constants';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { IProperty, ISelectProperty, ITask } from '@widgets/task-board/types';
import { Dispatch, SetStateAction } from 'react';

const useHandlePropertyCreation = (
  task: ITask,
  propertiesOrderKey: string,
  setTaskProperties: Dispatch<SetStateAction<IProperty[] | ISelectProperty[]>>,
  setTaskPropertiesOrder: Dispatch<React.SetStateAction<IProperty[] | ISelectProperty[]>>,
) => {
  const { priorityProperty, statusProperty, assigneeProperty, refetchProperties } = useTaskBoard();
  const { id, taskboardConfig, editTaskboardConfig } = useTaskBoard();
  const { createPriorityProperty } = useTaskPriorityProperty();
  const { editSelectProperty } = useEditTaskSelectProperty(id);

  const { createStatusProperty } = useTaskStatusProperty();
  const { editTaskStatusProperty } = useEditTaskStatusProperty(id);

  const { createAssigneeProperty } = useCreateAssigneeProperty();
  const { editAssigneeProperty } = useEditAssigneeProperty(id);

  const { createDateProperty } = useCreateDateProperty();
  const { editTaskDateProperty } = useEditTaskDateProperty();

  const { createEmailProperty } = useCreateEmailProperty();
  const { editEmailProperty } = useEditEmailProperty();

  const { createTextProperty } = useCreateTextProperty();
  const { editTextProperty } = useEditTextProperty();

  const { createNumberProperty } = useCreateNumberProperty();
  const { editNumberProperty } = useEditNumberProperty();

  const { createCheckboxProperty } = useCreateCheckboxProperty();
  const { editCheckboxProperty } = useEditCheckboxProperty();

  const { createMultiselectProperty } = useCreateMultiselectProperty();
  const { editMultiselectProperty } = useEditMultiselectProperty(id);

  const { createUrlProperty } = useCreateUrlProperty();
  const { editUrlProperty } = useEditUrlProperty();

  const { createDocLinksProperty } = useCreateDocLinksProperty();
  const { editDocLinksProperty } = useEditDocLinksProperty();

  const { createFilesProperty } = useCreateFilesProperty();
  const { editFilesProperty } = useEditFilesProperty();

  const updatePropertiesInfo = async (property: IProperty) => {
    if (property) {
      setTaskProperties((prev) => [...prev, property] as IProperty[]);
      if (!!taskboardConfig.find((c: any) => c.infoKey === propertiesOrderKey)) {
        editTaskboardConfig(
          taskboardConfig.map((c: any) =>
            c.infoKey === propertiesOrderKey
              ? {
                  infoKey: c.infoKey,
                  properties: [...c.properties, property],
                }
              : c,
          ),
        );
      } else {
        editTaskboardConfig([...taskboardConfig, { infoKey: propertiesOrderKey, properties: [property] }]);
      }
      setTaskPropertiesOrder((order) => [...order, property]);
    }
    refetchProperties();
  };

  const handlePropertyCreation = async (propertyType: string) => {
    switch (propertyType) {
      case SELECT_PROPERTY_TYPE: {
        let property = priorityProperty;
        if (!property) {
          const { priorities, nonePriorityId } = await createPriorityProperty(id);
          await editSelectProperty({ taskId: task.id, propertyId: priorities.id, optionId: nonePriorityId });
          property = priorities;
        }
        updatePropertiesInfo(property);
        break;
      }
      case STATUS_PROPERTY_TYPE: {
        let property = statusProperty;
        if (!property) {
          const { statuses, noneStatusId } = await createStatusProperty(id);
          await editTaskStatusProperty({ taskId: task.id, propertyId: statuses.id, optionId: noneStatusId });
          property = statuses;
        }
        updatePropertiesInfo(property);
        break;
      }
      case ASSIGNEE_PROPERTY_TYPE: {
        let property = assigneeProperty;
        if (!property) {
          property = await createAssigneeProperty({
            unitId: id,
            name: TASK_ASSIGNEE_PROPERTY,
          });
        }
        await editAssigneeProperty({ taskId: task.id, propertyId: property.id, userIds: [] });
        updatePropertiesInfo(property);
        break;
      }
      case NUMBER_PROPERTY_TYPE: {
        const property = await createNumberProperty({
          unitId: id,
          name: TASK_NUMBER_PROPERTY,
        });
        await editNumberProperty({ taskId: task.id, propertyId: property.id, value: 0 });
        updatePropertiesInfo(property);
        break;
      }
      case DATE_PROPERTY_TYPE: {
        const property = await createDateProperty({
          unitId: id,
          name: TASK_DATE_PROPERTY,
        });
        await editTaskDateProperty({ taskId: task.id, propertyId: property.id, value: null });
        updatePropertiesInfo(property);
        break;
      }
      case EMAIL_PROPERTY_TYPE: {
        const property = await createEmailProperty({
          unitId: id,
          name: TASK_EMAIL_PROPERTY,
        });
        await editEmailProperty({ taskId: task.id, propertyId: property.id, value: '' });
        updatePropertiesInfo(property);
        break;
      }
      case TEXT_PROPERTY_TYPE: {
        const property = await createTextProperty({
          unitId: id,
          name: TASK_TEXT_PROPERTY,
        });
        await editTextProperty({ taskId: task.id, propertyId: property.id, value: '' });
        updatePropertiesInfo(property);
        break;
      }
      case CHECKBOX_PROPERTY_TYPE: {
        const property = await createCheckboxProperty({
          unitId: id,
          name: TASK_CHECKBOX_PROPERTY,
        });
        await editCheckboxProperty({ taskId: task.id, propertyId: property.id, value: false });
        updatePropertiesInfo(property);
        break;
      }
      case MULTISELECT_PROPERTY_TYPE: {
        const property = await createMultiselectProperty({
          unitId: id,
          name: TASK_MULTISELECT_PROPERTY,
        });
        await editMultiselectProperty({ taskId: task.id, propertyId: property.id, value: [] });
        updatePropertiesInfo(property);
        break;
      }
      case URL_PROPERTY_TYPE: {
        const property = await createUrlProperty({
          unitId: id,
          name: TASK_URL_PROPERTY,
        });
        await editUrlProperty({ taskId: task.id, propertyId: property.id, value: '' });
        updatePropertiesInfo(property);
        break;
      }
      case DOC_LINKS_PROPERTY_TYPE: {
        const property = await createDocLinksProperty({
          unitId: id,
          name: TASK_DOC_LINKS_PROPERTY,
        });
        await editDocLinksProperty({ taskId: task.id, propertyId: property.id, value: [] });
        updatePropertiesInfo(property);
        break;
      }
      case FILE_PROPERTY_TYPE: {
        const property = await createFilesProperty({
          unitId: id,
          name: TASK_FILES_PROPERTY,
        });
        await editFilesProperty({ taskId: task.id, propertyId: property.id, value: [] });
        updatePropertiesInfo(property);
        break;
      }
    }
  };
  return handlePropertyCreation;
};

export default useHandlePropertyCreation;
