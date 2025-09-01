import { v4 as uuidv4 } from 'uuid';

import { useUnitsContext } from '@app/context/unitsContext/unitsContext';
import { useCreateTaskBoard as useCreateTaskBoardApi } from '@app/queries/board/useCreateTaskBoard';
import { useCreateTask } from '@app/queries/task/useCreateTask';
import { useEditTaskStatusProperty } from '@app/queries/property/status/useEditTaskStatusProperty';
import { useCreateAssigneeProperty } from '@app/queries/property/assign/useCreateAssigneeProperty';
import {
  TASK_ASSIGNEE_PROPERTY,
  TASK_DATE_PROPERTY,
} from '@widgets/task-board/constants';
import { useTaskPriorityProperty } from '@widgets/task-board/components/properties/priority/use-task-priority-property';
import { useTaskStatusProperty } from '@widgets/task-board/components/properties/status/use-task-status-property';
import { useEditTaskSelectProperty } from '@app/queries/property/select/useEditTaskSelectProperty';
import { useCreateDateProperty } from '@app/queries/property/date/useCreateDateProperty';
import { editDateProperty } from '@app/queries/property/date/useEditTaskDateProperty';

export const useCreateTaskBoard = () => {
  const { addUnit } = useUnitsContext();

  const { createTaskBoard } = useCreateTaskBoardApi();
  const { createTask } = useCreateTask();
  const { createAssigneeProperty } = useCreateAssigneeProperty();

  const { createPriorityProperty } = useTaskPriorityProperty();
  const { createStatusProperty } = useTaskStatusProperty();
  const { createDateProperty } = useCreateDateProperty();
  const { editSelectProperty } = useEditTaskSelectProperty();
  const { editTaskStatusProperty } = useEditTaskStatusProperty();

  const createBoard = async (parentId: string): Promise<string | undefined> => {
    const id = uuidv4();
    const board = await createTaskBoard({
      id,
      unitId: parentId,
      name: 'New list',
    });
    if (board) {
      addUnit(board);

      const task = await createTask({ unitId: board.id, name: 'First task' });

      await createAssigneeProperty({
        unitId: board.id,
        name: TASK_ASSIGNEE_PROPERTY,
      });

      const { priorities, nonePriorityId } = await createPriorityProperty(
        board.id,
      );
      await editSelectProperty({
        taskId: task.id,
        propertyId: priorities.id,
        optionId: nonePriorityId,
      });

      const { statuses, noneStatusId } = await createStatusProperty(board.id);
      await editTaskStatusProperty({
        taskId: task.id,
        propertyId: statuses.id,
        optionId: noneStatusId,
      });

      const dateProperty = await createDateProperty({ unitId: board.id, name: TASK_DATE_PROPERTY });
      await editDateProperty({
        taskId: task.id,
        propertyId: dateProperty.id,
        value: null,
      });

      return id;
    }

    return undefined;
  };

  return {
    createBoard,
  };
};
