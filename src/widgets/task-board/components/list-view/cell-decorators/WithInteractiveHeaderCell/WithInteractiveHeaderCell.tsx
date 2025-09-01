import React, { useCallback, useRef, useEffect } from 'react';

import { HeaderContext } from '@tanstack/table-core';
import { useCacheInvalidation } from '@app/queries/useCacheInvalidation';
import { useDeleteProperty } from '@app/queries/property/useDeleteProperty';
import { useCreateProperty } from '@app/queries/property/useCreateProperty';
import { useRenameProperty } from '@app/queries/property/useRenameProperty';
import { cn } from '@app/utils/cn';
import { ReactComponent as MoreButtonIcon } from '@images/icons/more.svg';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
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

import { useListTableContext } from '../../context/ListTableContext';
import ColumnFilters, { MENU_ACTION, Property } from '../../components/features/ColumnFilters';
import { STATIC_COLUMNS } from '../../list-table.model';
import styles from './styles.module.scss';


const MENU_ACTION_PROPERTY_MAP = {
  [MENU_ACTION.PROPERTY_TYPE_PRIORITY]: {
    name: TASK_PRIORITY_PROPERTY,
    type: SELECT_PROPERTY_TYPE,
  },
  [MENU_ACTION.PROPERTY_TYPE_ASSIGNEE]: {
    name: TASK_ASSIGNEE_PROPERTY,
    type: ASSIGNEE_PROPERTY_TYPE,
  },
  [MENU_ACTION.PROPERTY_TYPE_STATUS]: {
    name: TASK_STATUS_PROPERTY,
    type: STATUS_PROPERTY_TYPE,
  },
  [MENU_ACTION.PROPERTY_TYPE_DUE_DATE]: {
    name: TASK_DATE_PROPERTY,
    type: DATE_PROPERTY_TYPE,
  },
  [MENU_ACTION.PROPERTY_TYPE_EMAIL]: {
    name: TASK_EMAIL_PROPERTY,
    type: EMAIL_PROPERTY_TYPE,
  },
  [MENU_ACTION.PROPERTY_TYPE_TEXT]: {
    name: TASK_TEXT_PROPERTY,
    type: TEXT_PROPERTY_TYPE,
  },
  [MENU_ACTION.PROPERTY_TYPE_NUMBER]: {
    name: TASK_NUMBER_PROPERTY,
    type: NUMBER_PROPERTY_TYPE,
  },
  [MENU_ACTION.PROPERTY_TYPE_CHECKBOX]: {
    name: TASK_CHECKBOX_PROPERTY,
    type: CHECKBOX_PROPERTY_TYPE,
  },
  [MENU_ACTION.PROPERTY_TYPE_MULTISELECT]: {
    name: TASK_MULTISELECT_PROPERTY,
    type: MULTISELECT_PROPERTY_TYPE,
  },
  [MENU_ACTION.PROPERTY_TYPE_URL]: {
    name: TASK_URL_PROPERTY,
    type: URL_PROPERTY_TYPE,
  },
  [MENU_ACTION.PROPERTY_TYPE_DOC_LINKS]: {
    name: TASK_DOC_LINKS_PROPERTY,
    type: DOC_LINKS_PROPERTY_TYPE,
  },
  [MENU_ACTION.PROPERTY_TYPE_FILES]: {
    name: TASK_FILES_PROPERTY,
    type: FILE_PROPERTY_TYPE,
  },
} as const;

function InteractiveHeaderCell<TData, TValue>({
  context,
  options,
  ColumnComponent,
}: {
  context: HeaderContext<TData, TValue>;
  ColumnComponent: React.ComponentType<HeaderContext<TData, TValue>>;
  options?: { className?: string };
}) {
  const { column } = context;
  const { properties, id: boardId } = useTaskBoard();

  const property = properties.find((property) => property.id === context.column.id);

  const isNameColumn = column.id === STATIC_COLUMNS.NAME;
  const activeProperty = isNameColumn
    ? {
        type: 'text',
        name: 'Name',
        id: 'name',
        prohibitedActions: ['delete', 'change-property', 'hide-in-preview'],
      }
    : {
        ...property,
        prohibitedActions: ['hide-in-preview'],
      };

  const { setActiveColumnActionsMenu, activeColumnActionsMenu } = useListTableContext();
  const { deleteProperty } = useDeleteProperty(boardId);
  const { createProperty } = useCreateProperty();
  const { renameProperty } = useRenameProperty(boardId);
  const { invalidateTasks, invalidateTaskProperties } = useCacheInvalidation();

  // Stable refs for latest functions to avoid debounce recreation
  const stableRenameRef = useRef(renameProperty);
  const stableInvalidateRef = useRef(invalidateTaskProperties);
  const stableSetActiveRef = useRef(setActiveColumnActionsMenu);

  useEffect(() => {
    stableRenameRef.current = renameProperty;
    stableInvalidateRef.current = invalidateTaskProperties;
    stableSetActiveRef.current = setActiveColumnActionsMenu;
  });

  const handleOpenChange = (open: boolean) => {
    setActiveColumnActionsMenu(open ? column.id : null);
  };

  const handleMenuAction = async (action: MENU_ACTION, property?: Property) => {
    if (!property) return;

    switch (action) {
      case MENU_ACTION.HIDE_IN_VIEW: {
        context.table.getColumn(property.id)?.toggleVisibility();
        break;
      }
      case MENU_ACTION.DUPLICATE: {
        await createProperty(property.type, {
          unitId: boardId,
          name: property.name,
        });
        invalidateTasks(boardId);
        invalidateTaskProperties(boardId);
        break;
      }
      case MENU_ACTION.DELETE: {
        await deleteProperty(property.id);
        invalidateTasks(boardId);
        invalidateTaskProperties(boardId);
        break;
      }
      case MENU_ACTION.SORT_ASC: {
        context.column.toggleSorting(false);
        break;
      }
      case MENU_ACTION.SORT_DESC: {
        context.column.toggleSorting(true);
        break;
      }
      case MENU_ACTION.PROPERTY_TYPE_PRIORITY:
      case MENU_ACTION.PROPERTY_TYPE_ASSIGNEE:
      case MENU_ACTION.PROPERTY_TYPE_STATUS:
      case MENU_ACTION.PROPERTY_TYPE_DUE_DATE:
      case MENU_ACTION.PROPERTY_TYPE_EMAIL:
      case MENU_ACTION.PROPERTY_TYPE_TEXT:
      case MENU_ACTION.PROPERTY_TYPE_NUMBER:
      case MENU_ACTION.PROPERTY_TYPE_CHECKBOX:
      case MENU_ACTION.PROPERTY_TYPE_MULTISELECT:
      case MENU_ACTION.PROPERTY_TYPE_URL:
      case MENU_ACTION.PROPERTY_TYPE_DOC_LINKS:
      case MENU_ACTION.PROPERTY_TYPE_FILES:
        const propertyData = MENU_ACTION_PROPERTY_MAP[action];
        await deleteProperty(property.id);
        await createProperty(propertyData.type, {
          unitId: boardId,
          name: propertyData.name,
        });
    }

    setActiveColumnActionsMenu(null);
  };

  const handleColumnNameChange = useCallback(async (value: string, property?: Property) => {
    if (!property) return;
    
    try {
      await stableRenameRef.current({ name: value, propertyId: property.id });
      
      // Invalidate cache to update UI with new column name
      stableInvalidateRef.current(boardId);
      
      // Close column menu for better UX after successful rename
      stableSetActiveRef.current(null);
    } catch (error) {
      // Error handling is already done in useRenameProperty through errorHandler
      console.error('Failed to rename column:', error);
    }
  }, [boardId]);

  const isActive = column.id === activeColumnActionsMenu;

  return (
    <ColumnFilters
      searchValue={property?.name}
      open={isActive}
      onOpenChange={handleOpenChange}
      activeProperty={activeProperty as Property}
      onAction={handleMenuAction}
      onSearch={handleColumnNameChange}
      disableSearch={activeProperty.id === 'name'}
      trigger={
        <button className={cn(styles['action-button'], { [styles['active-light']]: isActive }, options?.className)}>
          <span className={styles['action-icon']}>
            <MoreButtonIcon className='transform rotate-90 self-center' />
          </span>
          <ColumnComponent {...context} />
        </button>
      }
    />
  );
}

function WithInteractiveHeaderCell<TData, TValue>(
  ColumnComponent: React.ComponentType<HeaderContext<TData, TValue>>,
  options?: { className?: string },
) {
  return function InteractiveHeaderCellWrapper(context: HeaderContext<TData, TValue>) {
    return (
      <InteractiveHeaderCell
        context={context}
        ColumnComponent={ColumnComponent}
        options={options}
      />
    );
  };
}
export default WithInteractiveHeaderCell;
