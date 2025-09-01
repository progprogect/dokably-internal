import { ITask } from '../types';

export const updateTaskHierarchy = function traverse(
  tasks: ITask[],
  predicate: (task: ITask) => boolean,
  updater: (task: ITask) => ITask | null,
): ITask[] {
  let updated = false;

  const traverseAndUpdate = (tasks: ITask[]): [ITask[], boolean] => {
    return [
      tasks.reduce<ITask[]>((acc, task) => {
        const [updatedSubtasks, childUpdated] = traverseAndUpdate(
          task.subtasks || [],
        );

        let newTask: ITask | null = task;
        let currentUpdated = false;

        if (predicate(task)) {
          newTask = updater(task);
          currentUpdated = true;
        }

        if (currentUpdated || childUpdated) {
          if (newTask) newTask = { ...newTask, subtasks: updatedSubtasks };
          updated = true;
        }

        if (newTask) return [...acc, newTask];

        return acc;
      }, []),
      updated,
    ];
  };

  const [newTasks] = traverseAndUpdate(tasks);
  return updated ? newTasks : tasks;
};
