import { v4 as uuidv4 } from 'uuid';

import { TASK_STATUS_PROPERTY } from '@widgets/task-board/constants';
import { useCreateStatusProperty } from '@app/queries/property/status/useCreateStatusProperty';

export const useTaskStatusProperty = () => {
  const { createStatusProperty: createStatusPropertyApi } =
    useCreateStatusProperty();

  const createStatusProperty = async (boardId: string) => {
    const noneStatusId = uuidv4();
    const noneStatus = {
      id: noneStatusId,
      name: 'None',
      params: {
        color: '#d4d4d5',
        index: 0,
      },
    };

    let toDoStatusId = uuidv4();
    const todoStatus = {
      id: toDoStatusId,
      name: 'To do',
      params: {
        color: '#daf4e7',
        index: 1,
      },
    };

    let inProgressStatusId = uuidv4();
    const inProgressStatus = {
      id: inProgressStatusId,
      name: 'In progress',
      params: {
        color: '#fde4bf',
        index: 2,
      },
    };

    let doneStatusId = uuidv4();
    const doneStatus = {
      id: doneStatusId,
      name: 'Done',
      params: {
        color: '#dfe9ff',
        index: 3,
      },
    };

    const statuses = await createStatusPropertyApi({
      unitId: boardId,
      name: TASK_STATUS_PROPERTY,
      options: [noneStatus, todoStatus, inProgressStatus, doneStatus],
    });

    return { statuses, noneStatusId };
  };

  return {
    createStatusProperty,
  };
};
