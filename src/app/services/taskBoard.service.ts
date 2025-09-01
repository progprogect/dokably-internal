import { BASE_API } from '@app/constants/endpoints';
import customFetch from '@app/utils/customFetch';
import { Unit } from '@entities/models/unit';
import { IProperty, ISelectProperty, ITask } from '@widgets/task-board/types';

export const createTaskBoard = async (
  id: string,
  unitId: string,
  name?: string,
): Promise<Unit | null> => {
  const rawResponse = await customFetch(`${BASE_API}/frontend/task-board`, {
    method: 'POST',
    body: JSON.stringify({
      id: id,
      unitId: unitId,
      name: name,
    }),
  });
  return await rawResponse.json();
};

export const getTasks = async (unitId: string): Promise<ITask[]> => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/${unitId}/task`,
  );
  return await rawResponse.json();
};

export const getTask = async (taskId: string) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/task/${taskId}`,
  );
  return await rawResponse.json();
};

export const getOptions = async (
  taskBoardUnitId: string,
  taskBoardPropertyId: string,
): Promise<{ id: string; title: string }[]> => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/${taskBoardUnitId}/property/${taskBoardPropertyId}/option`,
  );
  return await rawResponse.json();
};

export const getProperties = async (unitId: string | undefined) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/${unitId}/property`,
  );
  return await rawResponse.json();
};

export const createTask = async (
  unitId: string | undefined,
  name: string,
): Promise<Unit> => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/${unitId}/task`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: name,
      }),
    },
  );
  return await rawResponse.json();
};

export const createStatus = async (
  unitId: string | undefined,
  name: string,
  options?: any[],
): Promise<ISelectProperty> => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/${unitId}/status`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: name,
        options: options,
      }),
    },
  );
  return await rawResponse.json();
};

export const addTaskStatusOption = async (
  taskId: string,
  propertyId: string,
  value: any,
) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/task/${taskId}/property/${propertyId}/status`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: value,
      }),
    },
  );
  return await rawResponse.json();
};

export const addTaskDateOption = async (
  TaskId: string,
  PropertyId: string,
  value: string,
) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/task/${TaskId}/property/${PropertyId}/text`,
    {
      method: 'PUT',
      body: JSON.stringify({
        value,
      }),
    },
  );
  return await rawResponse.json();
};

export const addTaskAssigneeOption = async (
  taskId: string,
  propertyId: string,
  value: string,
) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/task/${taskId}/property/${propertyId}/text`,
    {
      method: 'PUT',
      body: JSON.stringify({
        value: value,
      }),
    },
  );
  return await rawResponse.json();
};

export const createTaskDate = async (unitId: string, name: string) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/${unitId}/text`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: name,
      }),
    },
  );
  return await rawResponse.json();
};

export const createTaskAssignee = async (unitId: string, name: string) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/${unitId}/text`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: name,
      }),
    },
  );
  return await rawResponse.json();
};

export const createTaskPriority = async (unitId: string, name: string) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/${unitId}/number`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: name,
      }),
    },
  );
  return await rawResponse.json();
};

export const deleteProperty = async (propertyId: string) => {
  await customFetch(`${BASE_API}/frontend/task-board/property/${propertyId}`, {
    method: 'DELETE',
  });
};

export const addTaskPriorityOption = async (
  taskId: string,
  propertyId: string,
  value: number,
) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/task/${taskId}/property/${propertyId}/number`,
    {
      method: 'PUT',
      body: JSON.stringify({
        value,
      }),
    },
  );
  return await rawResponse.json();
};

export const deleteTask = async (taskId: string) => {
  await customFetch(`${BASE_API}/frontend/task-board/task/${taskId}`, {
    method: 'DELETE',
  });
};

export const createTaskTags = async (
  unitId: string,
  name: string,
  tags: any,
) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/${unitId}/multiselect`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: name,
        options: tags,
      }),
    },
  );
  return await rawResponse.json();
};

export const addTaskTagsOption = async (
  TaskId: string,
  PropertyId: string,
  value: any,
) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/task/${TaskId}/property/${PropertyId}/multiselect`,
    {
      method: 'PUT',
      body: JSON.stringify({
        value: value,
      }),
    },
  );
  return await rawResponse.json();
};

export const editTask = async (taskId: string, task: ITask) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/task/${taskId}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        id: task.id,
        subtasksAmount: task.subtasksAmount,
        properties: task.properties,
        name: task.name,
      }),
    },
  );
  return await rawResponse.json();
};

export const getOptionsList = async (
  taskBoardUnitId: string,
  taskBoardPropertyId: string,
) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/${taskBoardUnitId}/property/${taskBoardPropertyId}/option`,
  );
  return await rawResponse.json();
};

export const getSubtaskList = async (
  unitId: string | undefined,
  parentTaskId: string,
) => {
  const rawResponse = await customFetch(
    `${BASE_API}/frontend/task-board/${unitId}/task?parentTaskId=${parentTaskId}`,
  );
  return await rawResponse.json();
};
