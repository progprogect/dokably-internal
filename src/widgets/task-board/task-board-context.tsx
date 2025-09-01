import React, { createContext, useState, ReactNode, useContext, useMemo, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { debounce, DebouncedFunc, isEqual } from 'lodash';

import { Unit } from '@entities/models/unit';
import { IProperty, ISelectOption, ISelectProperty, ITask } from '@widgets/task-board/types';
import { Option } from '@widgets/editor/plugins/blocks/Table/Table.types';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';
import { useGetTasks } from '@app/queries/task/useGetTasks';
import { useGetProperties } from '@app/queries/property/useGetProperties';
import { useEditStatusProperty } from '@app/queries/property/status/useEditStatusProperty';
import { useCreateTask } from '@app/queries/task/useCreateTask';
import { useEditTaskStatusProperty } from '@app/queries/property/status/useEditTaskStatusProperty';
import { useEditTaskSelectProperty } from '@app/queries/property/select/useEditTaskSelectProperty';
import { useEditAssigneeProperty } from '@app/queries/property/assign/useEditAssigneeProperty';
import { useDeleteTask } from '@app/queries/task/useDeleteTask';
import { useEditTask } from '@app/queries/task/useEditTask';
import { useChangeParentTask } from '@app/queries/task/sub-task/useChangeParentTask';
import { useCreateSubTask } from '@app/queries/task/sub-task/useCreateSubTask';
import { useEditNumberProperty } from '@app/queries/property/number/useEditNumberProperty';
import { editDateProperty, useEditTaskDateProperty } from '@app/queries/property/date/useEditTaskDateProperty';
import { useEditTaskTextProperty } from '@app/queries/property/text/useEditTaskTextProperty';
import { useCreateNumberProperty } from '@app/queries/property/number/useCreateNumberProperty';
import { useCreateEmailProperty } from '@app/queries/property/email/useCreateEmailProperty';
import { useEditEmailProperty } from '@app/queries/property/email/useEditEmailProperty';
import { useCreateTextProperty } from '@app/queries/property/text/useCreateTextProperty';
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
import { useEditMultiselectPropertyOptions } from '@app/queries/property/multiselect/useEditMultiselectPropertyOptions';
import { useGetTaskboardState } from '@app/queries/board/useGetTaskboardConfig';
import { usePutTaskboardConfig } from '@app/queries/board/usePutTaskboardConfig';

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
  TASK_MULTISELECT_PROPERTY,
  TASK_PRIORITY_PROPERTY,
  TASK_STATUS_PROPERTY,
  TEXT_PROPERTY_TYPE,
  URL_PROPERTY_TYPE,
} from './constants';
import { traverseTasks } from './utils/traverse-tasks';
import { updateTaskHierarchy } from './utils/update-task-hierarchy';

type TaskBoardContextType = {
  id: string;
  board: Unit | undefined;
  tasks: ITask[];
  statusProperty: ISelectProperty | undefined;
  priorityProperty: ISelectProperty | undefined;
  assigneeProperty: IProperty | undefined;
  statusOptions: ISelectOption[];
  priorityOptions: ISelectOption[];
  multiselectOptions: ISelectOption[];
  properties: IProperty[];
  updateProperties: (property: IProperty) => void;
  addTask: (name: string, statusId: string) => Promise<void>;
  updateTask: (task: ITask) => Promise<void>;
  duplicateTask: (task: ITask) => Promise<void>;
  addSubTask: (name: string, parentTaskId: string) => Promise<ITask | null>;
  deleteTask: (id: string) => Promise<void>;
  renameTask: (id: string, name: string) => Promise<void>;
  addStatus: (name: string, color: string) => Promise<void>;
  updateStatus: (statusProperty: ISelectOption) => Promise<void>;
  deleteStatus: (id: string) => Promise<void>;
  setTasks: (tasks: ITask[]) => void;
  updateTaskStatus: (taskId: string, statusId: string) => Promise<void>;
  updateTaskPriority: (taskId: string, priorityId: string) => Promise<void>;
  updateTaskAssignee: (taskId: string, userIds: string[]) => Promise<void>;
  updateTaskDueDate: (taskId: string, propertyId: string, value: Date | null) => Promise<void>;
  updateTaskNumber: (taskId: string, propertyId: string, value: number) => Promise<void>;
  updateTaskEmail: (taskId: string, propertyId: string, value: string) => Promise<void>;
  updateTaskText: (taskId: string, propertyId: string, value: string) => Promise<void>;
  updateTaskCheckbox: (taskId: string, propertyId: string, value: boolean) => Promise<void>;
  updateTaskMultiselect: (taskId: string, propertyId: string, value: string[]) => Promise<void>;
  updateTaskMultiselectOptions: (propertyId: string, options: Option[]) => Promise<void>;
  updateTaskUrl: (taskId: string, propertyId: string, value: string) => Promise<void>;
  updateTaskDocLinks: (taskId: string, propertyId: string, value: string[]) => Promise<void>;
  updateTaskFiles: (taskId: string, propertyId: string, value: string[]) => Promise<void>;
  updateTaskDescription: DebouncedFunc<(task: ITask, description: string) => Promise<void>>;
  refetchProperties: () => void;
  taskboardConfig: unknown[];
  refetchTaskboardConfig: () => void;
  editTaskboardConfig: (data: unknown[]) => void;
};

const TaskBoardContext = createContext<TaskBoardContextType | undefined>(undefined);

export const TaskBoardProvider: React.FC<{
  children: ReactNode;
  id: string;
}> = ({ children, id }) => {
  const [localTasks, setLocalTasks] = useState<ITask[]>([]);
  const [statusProperty, setStatusProperty] = useState<ISelectProperty>();
  const [priorityProperty, setPriorityProperty] = useState<ISelectProperty>();
  const [assigneeProperty, setAssigneeProperty] = useState<IProperty>();
  const [multiselectProperty, setMultiselectProperty] = useState<ISelectProperty>();

  const { editStatusProperty } = useEditStatusProperty(id);
  const { editTaskStatusProperty } = useEditTaskStatusProperty(id);
  const { editSelectProperty } = useEditTaskSelectProperty(id);
  const { editTaskDateProperty } = useEditTaskDateProperty(id);
  const { createTask } = useCreateTask(id, false);
  const { createSubTask } = useCreateSubTask();
  const { editAssigneeProperty } = useEditAssigneeProperty(id);
  const { deleteTask } = useDeleteTask(id);
  const { editTask } = useEditTask(id);
  const { changeParentTask } = useChangeParentTask(id);

  const { createNumberProperty } = useCreateNumberProperty();
  const { editNumberProperty } = useEditNumberProperty(id);
  const { editTaskTextProperty } = useEditTaskTextProperty(id);
  const { createEmailProperty } = useCreateEmailProperty();
  const { editEmailProperty } = useEditEmailProperty(id);
  const { createTextProperty } = useCreateTextProperty();
  const { createCheckboxProperty } = useCreateCheckboxProperty();
  const { editCheckboxProperty } = useEditCheckboxProperty(id);
  const { createMultiselectProperty } = useCreateMultiselectProperty();
  const { editMultiselectProperty } = useEditMultiselectProperty(id);
  const { editMultiselectPropertyOptions } = useEditMultiselectPropertyOptions();
  const { createUrlProperty } = useCreateUrlProperty();
  const { editUrlProperty } = useEditUrlProperty(id);
  const { createDocLinksProperty } = useCreateDocLinksProperty();
  const { editDocLinksProperty } = useEditDocLinksProperty(id);
  const { createFilesProperty } = useCreateFilesProperty();
  const { editFilesProperty } = useEditFilesProperty(id);

  const { units } = useUnitsContext();

  const board = useMemo<Unit | undefined>(
    () => units.find((unit) => unit.type === 'task_board' && unit.parentUnit && unit.id === id),
    [units, id],
  );

  const { tasks, refetch: refetchTasks } = useGetTasks({
    taskBoardId: id,
    enabled: board != undefined,
  });

  const { properties, refetch: refetchProperties } = useGetProperties({
    taskBoardId: id,
    enabled: board != undefined,
  });

  const { data: taskboardConfig, refetch: refetchTaskboardConfig } = useGetTaskboardState({
    taskBoardId: id,
    enabled: board != undefined,
  });
  const { editTaskboardConfig } = usePutTaskboardConfig(id);

  const updateProperties = async (property: IProperty) => {
    if (property.type === NUMBER_PROPERTY_TYPE) {
      await createNumberProperty({ unitId: id, name: property.name });
      refetchProperties();
    }
    if (property.type === EMAIL_PROPERTY_TYPE) {
      await createEmailProperty({ unitId: id, name: property.name });
      refetchProperties();
    }
    if (property.type === TEXT_PROPERTY_TYPE) {
      await createTextProperty({ unitId: id, name: property.name });
      refetchProperties();
    }
    if (property.type === CHECKBOX_PROPERTY_TYPE) {
      await createCheckboxProperty({ unitId: id, name: property.name });
      refetchProperties();
    }
    if (property.type === MULTISELECT_PROPERTY_TYPE) {
      await createMultiselectProperty({
        unitId: id,
        name: property.name,
        options: [
          // {"name": "first", "id": uuidv4(), params: { color: '#FFD646', index: 1, }},
        ],
      });
      refetchProperties();
    }
    if (property.type === URL_PROPERTY_TYPE) {
      await createUrlProperty({ unitId: id, name: property.name });
      refetchProperties();
    }
    if (property.type === DOC_LINKS_PROPERTY_TYPE) {
      await createDocLinksProperty({ unitId: id, name: property.name });
      refetchProperties();
    }
    if (property.type === FILE_PROPERTY_TYPE) {
      await createFilesProperty({ unitId: id, name: property.name });
      refetchProperties();
    }
    // if (property.type === TAG_PROPERTY_TYPE) {
    //   await createNumberProperty({ unitId: id, name: property.name });
    //   refetchProperties();
    // }
  };

  const statusOptions = useMemo<ISelectOption[]>(() => {
    const statuses = statusProperty?.options ?? [];
    statuses.sort((a, b) => a.params.index - b.params.index);
    return statuses;
  }, [statusProperty]);

  const priorityOptions = useMemo<ISelectOption[]>(() => {
    const priorities = priorityProperty?.options ?? [];
    priorities.sort((a, b) => a.params.index - b.params.index);
    return priorities;
  }, [priorityProperty]);

  const multiselectOptions = useMemo<ISelectOption[]>(() => {
    const priorities = multiselectProperty?.options ?? [];
    priorities.sort((a, b) => a.params.index - b.params.index);
    return priorities;
  }, [multiselectProperty]);

  const equals = localTasks === tasks;

  useEffect(() => {
    if (!equals) setLocalTasks(tasks);
  }, [equals, tasks]);

  useEffect(() => {
    const statusProperty = properties.find((x) => x.type === STATUS_PROPERTY_TYPE && x.name === TASK_STATUS_PROPERTY);
    if (statusProperty) {
      setStatusProperty(statusProperty as ISelectProperty);
    } else {
      setStatusProperty(undefined);
    }

    const assigneeProperty = properties.find(
      (x) => x.type === ASSIGNEE_PROPERTY_TYPE && x.name === TASK_ASSIGNEE_PROPERTY,
    );
    if (assigneeProperty) {
      setAssigneeProperty(assigneeProperty as IProperty);
    } else {
      setAssigneeProperty(undefined);
    }

    const priorityProperty = properties.find(
      (x) => x.type === SELECT_PROPERTY_TYPE && x.name === TASK_PRIORITY_PROPERTY,
    );
    if (priorityProperty) {
      setPriorityProperty(priorityProperty as ISelectProperty);
    } else {
      setPriorityProperty(undefined);
    }

    const multiselectProperty = properties.find(
      (x) => x.type === MULTISELECT_PROPERTY_TYPE && x.name.toLowerCase() === TASK_MULTISELECT_PROPERTY.toLowerCase(),
    );
    if (multiselectProperty) {
      setMultiselectProperty(multiselectProperty as ISelectProperty);
    } else {
      setMultiselectProperty(undefined);
    }
  }, [properties]);

  const updateLocalTask = useCallback((newTask: ITask) => {
    setLocalTasks((tasks) =>
      updateTaskHierarchy(
        tasks,
        (task) => task.id === newTask.id,
        () => newTask,
      ),
    );
  }, []);

  const updateTaskPropertyValue = useCallback(<V,>(task: ITask, propertyId: string, value: V): ITask => {
    return {
      ...task,
      properties: task.properties.map((property) => {
        if (property.id === propertyId) return { ...property, value };
        return property;
      }),
    };
  }, []);

  const revertLocalTask = useCallback(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const addTask = async (name: string, statusId: string) => {
    const task = await createTask({ unitId: id, name: name });

    await editAssigneeProperty({
      taskId: task.id,
      propertyId: `${assigneeProperty?.id}`,
      userIds: [],
    });
  
    if (statusProperty) {
      await editTaskStatusProperty({
        taskId: task.id,
        propertyId: statusProperty.id,
        optionId: statusId,
      });
    }

    const nonePriority = priorityOptions.find((x) => x.name === 'None');
    if (nonePriority && priorityProperty) {
      await editSelectProperty({
        taskId: task.id,
        propertyId: priorityProperty?.id,
        optionId: nonePriority.id,
      });
    }
    const dateProperty = properties.find((p) => p.type === DATE_PROPERTY_TYPE);
    if (dateProperty) {
      await editDateProperty({
        taskId: task.id,
        propertyId: dateProperty.id,
        value: null,
      });
    }
    const tasks = await refetchTasks();
    const propertiesOrder = {
      infoKey: `kanban-task-${task.id}-propertiesOrder`,
      properties: tasks.data?.find((task) => task.name === name)?.properties,
    };
    editTaskboardConfig([...taskboardConfig, propertiesOrder]);
    // toast.success('Task created');
  };

  const addSubTask = async (name: string, parentTaskId: string) => {
    const subtask = await createSubTask({ unitId: id, name: name });
    await changeParentTask({
      taskId: subtask.id,
      parentTaskId: parentTaskId,
    });
    if (statusOptions.length > 0 && statusProperty) {
      await editTaskStatusProperty({
        taskId: subtask.id,
        propertyId: statusProperty.id,
        optionId: statusOptions[0].id,
      });
    }

    const nonePriority = priorityOptions.find((x) => x.name === 'None');
    if (nonePriority && priorityProperty) {
      await editSelectProperty({
        taskId: subtask.id,
        propertyId: priorityProperty.id,
        optionId: nonePriority.id,
      });
    }

    const dateProperty = properties.find((p) => p.type === DATE_PROPERTY_TYPE);
    if (dateProperty) {
      await editDateProperty({
        taskId: subtask.id,
        propertyId: dateProperty.id,
        value: null,
      });
    }

    // toast.success('Sub-task created');
    return subtask;
  };

  const updateTaskStatus = async (taskId: string, statusId: string) => {
    if (statusProperty) {
      const task = localTasks.find((x) => x.id === taskId);
      if (task) {
        const status = task.properties.find((x) => x.type === STATUS_PROPERTY_TYPE && x.name === TASK_STATUS_PROPERTY);
        if (status) {
          const newProperties = task.properties.filter((x) => x.id != status.id);
          const newStatusProperty = {
            ...status,
            value: statusId,
          };
          task.properties = [...newProperties, newStatusProperty];
          updateLocalTask(task);
        }
      }

      await editTaskStatusProperty({
        taskId: taskId,
        propertyId: statusProperty.id,
        optionId: statusId,
      });

      // toast.success('Task status updated');
    }
  };

  const addStatus = async (name: string, color: string) => {
    if (board && statusProperty) {
      const newStatusId = uuidv4();
      const newStatus = {
        id: newStatusId,
        name: name,
        params: {
          color: color,
          index: statusProperty.options.length,
        },
      };

      const updatedStatusProperty = {
        ...statusProperty,
        options: [...statusProperty.options, newStatus],
      };

      await editStatusProperty({
        boardId: board.id,
        propertyId: statusProperty.id,
        ...updatedStatusProperty,
      });
      // setStatusProperty(updatedStatusProperty);
      // toast.success('Status created');
    }
  };

  const updateStatus = async (statusOption: ISelectOption) => {
    if (statusProperty) {
      const options = statusProperty.options.filter((x) => x.id !== statusOption.id);

      const updatedStatusProperty = {
        ...statusProperty,
        options: [...options, statusOption],
      };

      await editStatusProperty({
        boardId: id,
        propertyId: statusProperty.id,
        ...updatedStatusProperty,
      });
      setStatusProperty(updatedStatusProperty);
      // toast.success('Status updated');
    }
  };

  const deleteStatus = async (id: string) => {
    if (board && statusProperty) {
      const options = statusProperty.options.filter((x) => x.id !== id);

      const updatedStatusProperty = {
        ...statusProperty,
        options: [...options],
      };

      await editStatusProperty({
        boardId: board.id,
        propertyId: statusProperty.id,
        ...updatedStatusProperty,
      });
      setStatusProperty(updatedStatusProperty);
      await refetchTasks();
      // toast.success('Status deleted');
    }
  };

  const updateTaskPriority = async (taskId: string, priorityId: string) => {
    if (priorityProperty) {
      const task = localTasks.find((x) => x.id === taskId);
      if (task) {
        const priority = task.properties.find(
          (x) => x.type === SELECT_PROPERTY_TYPE && x.name === TASK_PRIORITY_PROPERTY,
        );
        if (priority) {
          const newProperties = task.properties.filter((x) => x.id != priority.id);
          const newSelectProperty = {
            ...priority,
            value: priorityId,
          };
          task.properties = [...newProperties, newSelectProperty];
          setLocalTasks((prev) =>
            prev.map((x) => {
              if (x.id === task.id) {
                return task;
              }
              return x;
            }),
          );
        }
      }

      await editSelectProperty({
        taskId: taskId,
        propertyId: priorityProperty.id,
        optionId: priorityId,
      });
    }
  };

  const updateTaskAssignee = async (taskId: string, userIds: string[]) => {
    const assigneeProperty = properties.find(
      (x) => x.type === ASSIGNEE_PROPERTY_TYPE && x.name === TASK_ASSIGNEE_PROPERTY,
    );
    if (assigneeProperty) {
      const task = localTasks.find((x) => x.id === taskId);
      if (task) {
        const property = task.properties.find(
          (x) => x.type === ASSIGNEE_PROPERTY_TYPE && x.name === TASK_ASSIGNEE_PROPERTY,
        );
        if (property) {
          const newProperties = task.properties.filter((x) => x.id != property.id);
          const newProperty = {
            ...property,
            value: userIds,
          };
          task.properties = [...newProperties, newProperty];
          setLocalTasks((prev) =>
            prev.map((x) => {
              if (x.id === task.id) {
                return task;
              }
              return x;
            }),
          );
        }
      }

      await editAssigneeProperty({
        taskId: taskId,
        propertyId: assigneeProperty.id,
        userIds: userIds,
      });
    }
  };

  const updateTaskDueDate = useCallback(
    async (taskId: string, propertyId: string, value: Date | null) => {
      setLocalTasks((tasks) =>
        updateTaskHierarchy(
          tasks,
          (task) => task.id === taskId,
          (task) => updateTaskPropertyValue(task, propertyId, value),
        ),
      );

      await editTaskDateProperty({ taskId, propertyId, value });
    },
    [editTaskDateProperty, updateTaskPropertyValue],
  );

  const updateTaskText = useCallback(
    async (taskId: string, propertyId: string, value: string) => {
      setLocalTasks((tasks) =>
        updateTaskHierarchy(
          tasks,
          (task) => task.id === taskId,
          (task) => updateTaskPropertyValue(task, propertyId, value),
        ),
      );

      await editTaskTextProperty({ taskId, propertyId, value });
    },
    [editTaskTextProperty, updateTaskPropertyValue],
  );

  const updateTaskNumber = async (taskId: string, propertyId: string, value: number) => {
    const task = localTasks.find((x) => x.id === taskId);
    if (task) {
      const property = task.properties.find((x) => x.id === propertyId);
      if (property) {
        const newProperties = task.properties.filter((x) => x.id != property.id);
        const newProperty = {
          ...property,
          value: value,
        };
        task.properties = [...newProperties, newProperty];
        setLocalTasks((prev) =>
          prev.map((x) => {
            if (x.id === task.id) {
              return task;
            }
            return x;
          }),
        );
      }
    }

    await editNumberProperty({
      taskId: taskId,
      propertyId: propertyId,
      value: value,
    });
  };

  const updateTaskEmail = async (taskId: string, propertyId: string, value: string) => {
    // @TODO
    await editEmailProperty({
      taskId: taskId,
      propertyId: propertyId,
      value: value,
    });
  };

  const updateTaskCheckbox = async (taskId: string, propertyId: string, value: boolean) => {
    // @TODO
    await editCheckboxProperty({
      taskId: taskId,
      propertyId: propertyId,
      value: value,
    });
  };

  const updateTaskMultiselect = async (taskId: string, propertyId: string, value: string[]) => {
    if (multiselectProperty) {
      const task = localTasks.find((x) => x.id === taskId);
      if (task) {
        const multiselect = task.properties.find(
          (x) => x.type === MULTISELECT_PROPERTY_TYPE && x.name === TASK_MULTISELECT_PROPERTY,
        );
        if (multiselect) {
          const newProperties = task.properties.filter((x) => x.id != multiselect.id);
          const newSelectProperty = {
            ...multiselect,
            value: propertyId,
          };
          task.properties = [...newProperties, newSelectProperty];
          setLocalTasks((prev) =>
            prev.map((x) => {
              if (x.id === task.id) {
                return task;
              }
              return x;
            }),
          );
        }
      }
    }
    await editMultiselectProperty({
      taskId: taskId,
      propertyId: propertyId,
      value: value,
    });
  };

  const updateTaskMultiselectOptions = async (propertyId: string, options: Option[]) => {
    setMultiselectProperty({
      ...(multiselectProperty ? multiselectProperty : { id: propertyId } as any),
      options: options.map((option, index) => ({
        id: option.id,
        name: option.label,
        params: { color: option.color, index },
      })),
    });
    await editMultiselectPropertyOptions({
      unitId: id,
      propertyId: propertyId,
      options: options,
    });
  };

  const updateTaskUrl = async (taskId: string, propertyId: string, value: string) => {
    // @TODO
    await editUrlProperty({
      taskId: taskId,
      propertyId: propertyId,
      value: value,
    });
  };

  const updateTaskDocLinks = async (taskId: string, propertyId: string, value: string[]) => {
    // @TODO
    await editDocLinksProperty({
      taskId: taskId,
      propertyId: propertyId,
      value: value,
    });
  };

  const updateTaskFiles = async (taskId: string, propertyId: string, value: string[]) => {
    // @TODO
    await editFilesProperty({
      taskId: taskId,
      propertyId: propertyId,
      value: value,
    });
  };

  const handleDeleteTask = useCallback(
    async (id: string) => {
      setLocalTasks((tasks) =>
        updateTaskHierarchy(
          tasks,
          (task) => task.id === id,
          () => null,
        ),
      );

      await deleteTask(id);
      toast.success('Task deleted');
    },
    [deleteTask],
  );

  const handleDuplicateTask = useCallback(
    async (task: Omit<ITask, 'id'>) => {
      const createdTask = await createTask({ unitId: id, name: task.name });
      await editTask({ task, taskId: createdTask.id });
      await refetchTasks();
      toast.success('Task duplicated');
    },
    [createTask, editTask, id, refetchTasks],
  );

  const handleRenameTask = useCallback(
    async (id: string, name: string) => {
      let task: ITask | undefined;
      traverseTasks(localTasks, (t, stop) => {
        if (t.id === id) {
          stop();
          task = t;
        }
      });

      if (task && task.name != name) {
        await editTask({ taskId: id, task: { ...task, name: name } });

        setLocalTasks((tasks) =>
          updateTaskHierarchy(
            tasks,
            (task) => task.id === id,
            (task) => ({ ...task, name }),
          ),
        );
      }
    },
    [editTask, localTasks],
  );

  const handleUpdateTask = useCallback<TaskBoardContextType['updateTask']>(
    async (task) => {
      try {
        updateLocalTask(task);
        await editTask({ task, taskId: task.id });
        await refetchTasks();
        toast.success('Task updated');
      } catch {
        revertLocalTask();
      }
    },
    [editTask, refetchTasks, revertLocalTask, updateLocalTask],
  );

  const handleUpdateTaskDescription = useCallback(
    debounce(async (task: ITask, description: string) => {
      if (!isEqual((task.description ?? '').trim(), description)) {
        await editTask({ task: { ...task, description }, taskId: task.id });
        // await refetchTasks();
      }
    }, 500),
    [editTask, refetchTasks],
  );

  return (
    <TaskBoardContext.Provider
      value={{
        id: id,
        board: board,
        tasks: localTasks,
        statusProperty: statusProperty,
        priorityProperty: priorityProperty,
        addTask: addTask,
        updateTask: handleUpdateTask,
        addStatus: addStatus,
        properties: properties,
        updateProperties: updateProperties,
        updateStatus: updateStatus,
        statusOptions: statusOptions,
        priorityOptions: priorityOptions,
        multiselectOptions: multiselectOptions,
        deleteStatus: deleteStatus,
        duplicateTask: handleDuplicateTask,
        updateTaskStatus: updateTaskStatus,
        updateTaskPriority: updateTaskPriority,
        updateTaskAssignee: updateTaskAssignee,
        updateTaskDueDate,
        updateTaskNumber: updateTaskNumber,
        updateTaskEmail: updateTaskEmail,
        updateTaskCheckbox: updateTaskCheckbox,
        updateTaskMultiselect: updateTaskMultiselect,
        updateTaskMultiselectOptions: updateTaskMultiselectOptions,
        updateTaskUrl: updateTaskUrl,
        updateTaskDocLinks: updateTaskDocLinks,
        updateTaskFiles: updateTaskFiles,
        deleteTask: handleDeleteTask,
        renameTask: handleRenameTask,
        addSubTask: addSubTask,
        setTasks: setLocalTasks,
        updateTaskText,
        assigneeProperty: assigneeProperty,
        updateTaskDescription: handleUpdateTaskDescription,
        refetchProperties: refetchProperties,
        taskboardConfig: taskboardConfig,
        refetchTaskboardConfig: refetchTaskboardConfig,
        editTaskboardConfig: editTaskboardConfig,
      }}
    >
      {children}
    </TaskBoardContext.Provider>
  );
};

export const useTaskBoard = () => {
  const context = useContext(TaskBoardContext);
  if (!context) {
    throw new Error('useTaskBoard must be used within TaskBoardProvider');
  }
  return context;
};
