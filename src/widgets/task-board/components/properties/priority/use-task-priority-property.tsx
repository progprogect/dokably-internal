import { v4 as uuidv4 } from 'uuid';

import { useCreateSelectProperty } from '@app/queries/property/select/useCreateSelectProperty';
import { TASK_PRIORITY_PROPERTY } from '@widgets/task-board/constants';

export const useTaskPriorityProperty = () => {
  const { createSelectProperty } = useCreateSelectProperty();

  const createPriorityProperty = async (
    boardId: string,
  ) => {
    const nonePriorityId = uuidv4();
    const nonePriority = {
      id: nonePriorityId,
      name: 'None',
      params: {
        color: '#A9A9AB',
        index: 0,
      },
    };

    let lowPriorityId = uuidv4();
    const lowPriority = {
      id: lowPriorityId,
      name: 'Low',
      params: {
        color: '#FFD646',
        index: 1,
      },
    };

    let mediumPriorityId = uuidv4();
    const mediumPriority = {
      id: mediumPriorityId,
      name: 'Medium',
      params: {
        color: '#65D7A0',
        index: 2,
      },
    };

    let highPriorityId = uuidv4();
    const highPriority = {
      id: highPriorityId,
      name: 'High',
      params: {
        color: '#FF5065',
        index: 3,
      },
    };

    const priorities = await createSelectProperty({
      unitId: boardId,
      name: TASK_PRIORITY_PROPERTY,
      options: [nonePriority, lowPriority, mediumPriority, highPriority],
    });

    return {
      priorities,
      nonePriorityId,
    };
  };

  return {
    createPriorityProperty,
  };
};
