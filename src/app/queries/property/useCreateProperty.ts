import { useCallback } from 'react';
import { useCreateAssigneeProperty } from './assign/useCreateAssigneeProperty';
import { useCreateDateProperty } from './date/useCreateDateProperty';
import { useCreateNumberProperty } from './number/useCreateNumberProperty';
import { useCreateTextProperty } from './text/useCreateTextProperty';
import { PropertyType } from '@widgets/task-board/constants';
import { useCacheInvalidation } from '../useCacheInvalidation';
import { useTaskPriorityProperty } from '@widgets/task-board/components/properties/priority/use-task-priority-property';
import { useTaskStatusProperty } from '@widgets/task-board/components/properties/status/use-task-status-property';
import { useCreateEmailProperty } from './email/useCreateEmailProperty';
import { useCreateCheckboxProperty } from './checkbox/useCreateCheckboxProperty';
import toast from 'react-hot-toast';
import { errorToastOptions } from '@shared/common/Toast';
import { useCreateMultiselectProperty } from './multiselect/useCreateMultiselectProperty';
import { useCreateUrlProperty } from './url/useCreateUrlProperty';
import { useCreateDocLinksProperty } from './docLinks/useCreateDocLinksProperty';
import { useCreateFilesProperty } from './files/useCreateFilesProperty';
import { useTaskBoard } from '@widgets/task-board/task-board-context';

export function useCreateProperty() {
  const { createPriorityProperty } = useTaskPriorityProperty();
  const { createAssigneeProperty } = useCreateAssigneeProperty();
  const { createStatusProperty } = useTaskStatusProperty();
  const { createDateProperty } = useCreateDateProperty();
  const { createEmailProperty } = useCreateEmailProperty();
  const { createTextProperty } = useCreateTextProperty();
  const { createNumberProperty } = useCreateNumberProperty();
  const { createCheckboxProperty } = useCreateCheckboxProperty();
  const { createMultiselectProperty } = useCreateMultiselectProperty();
  const { createUrlProperty } = useCreateUrlProperty();
  const { createDocLinksProperty } = useCreateDocLinksProperty();
  const { createFilesProperty } = useCreateFilesProperty();

  const { invalidateTaskProperties, invalidateTasks, invalidateTaskboardConfig } = useCacheInvalidation();
  const { taskboardConfig, editTaskboardConfig, properties } = useTaskBoard();

  // Helper function to update column order so new columns are added to the end
  const updateColumnOrder = useCallback(async (unitId: string, newPropertyId: string) => {

    // Wait a bit for the new property to be available in the cache
    await new Promise(resolve => setTimeout(resolve, 100));

    const columnOrderKey = `table-${unitId}-columnOrder`;
    const existingConfig = taskboardConfig.find((c: any) => c.infoKey === columnOrderKey);
    
    // Get current column order or create default one based on all properties
    let currentOrder = (existingConfig as any)?.data || [];
    
    // If no saved order exists, create a proper default order
    if (currentOrder.length === 0) {
      currentOrder = [
        'name', // STATIC_COLUMNS.NAME
        ...properties.map(prop => prop.id),
        'actions' // STATIC_COLUMNS.ACTIONS
      ];
    }
    
    // Add new property at the end of properties list, but before 'actions' column
    if (!currentOrder.includes(newPropertyId)) {
      const actionsIndex = currentOrder.indexOf('actions');
      let updatedOrder;
      
      if (actionsIndex !== -1) {
        // Insert before actions column (which contains the + button)
        updatedOrder = [
          ...currentOrder.slice(0, actionsIndex),
          newPropertyId,
          ...currentOrder.slice(actionsIndex)
        ];

      } else {
        // If no actions column found, add at the very end
        updatedOrder = [...currentOrder, newPropertyId];

      }
      
      // Update taskboard config with new column order
      const filteredConfig = taskboardConfig.filter((c: any) => c.infoKey !== columnOrderKey);
      const newConfig = [
        ...filteredConfig,
        { infoKey: columnOrderKey, data: updatedOrder }
      ];
      

      await editTaskboardConfig(newConfig);
    }
  }, [taskboardConfig, editTaskboardConfig, properties]);

  const createProperty = useCallback(
    async (type: PropertyType, data: { unitId: string; name: string }) => {

      let newPropertyId: string | undefined;
      
      switch (type) {
        case 'assignee':
          const assigneeProperty = await createAssigneeProperty(data);
          newPropertyId = assigneeProperty?.id;
          break;
        case 'date':
          const dateProperty = await createDateProperty(data);
          newPropertyId = dateProperty?.id;
          break;
        case 'number':
          const numberProperty = await createNumberProperty(data);
          newPropertyId = numberProperty?.id;
          break;
        case 'select':
          const priorityResult = await createPriorityProperty(data.unitId);
          newPropertyId = priorityResult?.priorities?.id;
          break;
        case 'status':
          const statusResult = await createStatusProperty(data.unitId);
          newPropertyId = statusResult?.statuses?.id;
          break;
        case 'text':
          const textProperty = await createTextProperty(data);
          newPropertyId = textProperty?.id;
          break;
        case 'email':
          const emailProperty = await createEmailProperty(data);
          newPropertyId = emailProperty?.id;
          break;
        case 'checkbox':
          const checkboxProperty = await createCheckboxProperty(data);
          newPropertyId = checkboxProperty?.id;
          break;
        case 'multiselect':
          const multiselectProperty = await createMultiselectProperty({ ...data, options: [] });
          newPropertyId = multiselectProperty?.id;
          break;
        case 'url':
          const urlProperty = await createUrlProperty(data);
          newPropertyId = urlProperty?.id;
          break;
        case 'doc_link':
          const docLinksProperty = await createDocLinksProperty(data);
          newPropertyId = docLinksProperty?.id;
          break;
        case 'file':
          const filesProperty = await createFilesProperty(data);
          newPropertyId = filesProperty?.id;
          break;
        default:
          toast.error(`Unhandled property type: ${type}`, errorToastOptions);
          throw new Error(`Unhandled property type: ${type}`);
      }


      
      invalidateTaskProperties(data.unitId);
      invalidateTasks(data.unitId);

      // Update column order to add the new property to the end
      if (newPropertyId) {

        // If we have the property ID directly from the creation function
        await updateColumnOrder(data.unitId, newPropertyId);
        
        // Critical: Invalidate taskboard config AFTER updating column order
        // This prevents race conditions where old column order overwrites new one

        
        // Small delay to ensure server has processed the column order update
        setTimeout(() => {

          invalidateTaskboardConfig(data.unitId);
        }, 100);
      } else {

        // Fallback: wait for properties to update and find the new one
        setTimeout(async () => {
          try {
            // Refetch to get updated properties
            await invalidateTaskProperties(data.unitId);
          } catch (error) {
            console.warn('Failed to update column order after property creation:', error);
          }
        }, 200);
      }
    },
    [
      createAssigneeProperty,
      createCheckboxProperty,
      createDateProperty,
      createEmailProperty,
      createMultiselectProperty,
      createNumberProperty,
      createPriorityProperty,
      createStatusProperty,
      createTextProperty,
      createUrlProperty,
      createDocLinksProperty,
      createFilesProperty,
      invalidateTaskProperties,
      invalidateTasks,
      invalidateTaskboardConfig,
      updateColumnOrder,
    ],
  );

  return { createProperty };
}
