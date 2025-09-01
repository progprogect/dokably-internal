import { ITask } from '../types';

export const traverseTasks = function traverse<R>(
  tasks: ITask[],
  callback: (task: ITask, stop: () => void) => R,
) {
  let stopped = false;

  const stop = () => (stopped = true);

  for (const task of tasks) {
    if (stopped) break;
    callback(task, stop);
    if (task.subtasks?.length) traverse(task.subtasks, callback);
  }
};
