import { ITask } from '@widgets/task-board/types';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  getVirtualTaskParent,
  getVirtualTaskType,
  VirtualTask,
} from '../list-table.model';

type EditableTask = {
  task: ITask;
  value: keyof ITask;
};

type ListTableContextType = {
  injectVirtualTasks: (tasks: ITask[]) => VirtualTask[];
  removeVirtualTask: (task: VirtualTask) => void;
  addVirtualTask: (task: VirtualTask) => void;
  setEditableTask: (task: EditableTask | null) => void;
  setActiveColumnActionsMenu: (columnId: string | null) => void;
  editableTask: EditableTask | null;
  activeColumnActionsMenu: string | null;
};

const listTableContext = createContext<ListTableContextType | null>(null);

function ListTableContextProvider({ children }: PropsWithChildren) {
  const [virtualTasks, setVirtualTasks] = useState<Array<VirtualTask>>([]);
  const [editableTask, setEditableTask] = useState<EditableTask | null>(null);
  const [activeColumnActionsMenu, setActiveColumnActionsMenu] = useState<
    string | null
  >(null);

  const injectVirtualTasks = useCallback(
    (tasks: ITask[]): VirtualTask[] => {
      return virtualTasks.reduce<ITask[]>((acc, virtualTask) => {
        const parent = getVirtualTaskParent(virtualTask);
        if (!parent) return [...acc, virtualTask];

        return acc.map((task) => {
          if (task.id !== parent) return task;
          return {
            ...task,
            subtasks: [virtualTask, ...(task.subtasks ?? [])],
          };
        });
      }, tasks);
    },
    [virtualTasks],
  );

  const filterVirtualTaskByType = useCallback(
    (prev: Array<VirtualTask>, task: VirtualTask) =>
      prev.filter(
        (prevTask) => getVirtualTaskType(prevTask) !== getVirtualTaskType(task),
      ),
    [],
  );

  const removeVirtualTask = useCallback(
    (task: VirtualTask): void => {
      setVirtualTasks((prev) => filterVirtualTaskByType(prev, task));
    },
    [filterVirtualTaskByType],
  );

  const addVirtualTask = useCallback(
    (task: VirtualTask) => {
      setVirtualTasks((prev) => [...filterVirtualTaskByType(prev, task), task]);
    },
    [filterVirtualTaskByType],
  );

  const value = useMemo(() => {
    return {
      injectVirtualTasks,
      removeVirtualTask,
      addVirtualTask,
      setEditableTask,
      setActiveColumnActionsMenu,
      activeColumnActionsMenu,
      editableTask,
    };
  }, [
    activeColumnActionsMenu,
    addVirtualTask,
    editableTask,
    injectVirtualTasks,
    removeVirtualTask,
  ]);

  return (
    <listTableContext.Provider value={value}>
      {children}
    </listTableContext.Provider>
  );
}

export function useListTableContext() {
  const context = useContext(listTableContext);

  if (!context) {
    throw new Error(
      'ListTableContextProvider is mandatory to use ListTableContext',
    );
  }

  return context;
}

export default ListTableContextProvider;
