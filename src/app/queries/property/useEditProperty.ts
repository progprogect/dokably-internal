import { useCallback } from 'react';
import { PropertyType } from '@widgets/task-board/constants';
import toast from 'react-hot-toast';
import { errorToastOptions } from '@shared/common/Toast';
import { useEditStatusProperty } from './status/useEditStatusProperty';
import { useEditSelectProperty } from './select/useEditSelectProperty';
import { useEditMultiselectProperty } from './multiselect/useEditMultiselectProperty';
import { useEditDocLinksProperty } from './docLinks/useEditDocLinksProperty';

export function useEditProperty(boardId: string) {
  const { editStatusProperty } = useEditStatusProperty(boardId);
  const { editSelectProperty } = useEditSelectProperty(boardId);
  const { editMultiselectProperty } = useEditMultiselectProperty(boardId);
  const { editDoclinksProperty } = useEditDocLinksProperty(boardId);

  const editProperty = useCallback(
    async (type: PropertyType, propertyId: string, body: any) => {
      switch (type) {
        case 'select':
          await editStatusProperty({ ...body, boardId, propertyId });
          break;
        case 'status':
          await editSelectProperty({ ...body, boardId, propertyId });
          break;
        case 'multiselect':
          await editMultiselectProperty({ ...body, boardId, propertyId });
          break;
        case 'doc_link':
          await editDoclinksProperty({ ...body, boardId, propertyId });
          break;
        case 'assignee':
        case 'date':
        case 'number':
        case 'text':
        case 'email':
        case 'checkbox':
        case 'url':
        case 'file':
        default:
          toast.error(`Unhandled property type: ${type}`, errorToastOptions);
      }
    },
    [boardId, editDoclinksProperty, editMultiselectProperty, editSelectProperty, editStatusProperty],
  );

  return { editProperty };
}
