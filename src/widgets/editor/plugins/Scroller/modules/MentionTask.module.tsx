import { useState, useDeferredValue, useMemo, useEffect } from 'react';

import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import useInsertMention from '@app/hooks/editor/useInsertMention';
import SearchInput from '@shared/common/input/SearchInput';
import { Unit } from '@entities/models/unit';
import { getTask } from '@app/services/taskBoard.service';
import { getDeletedUnits } from '@app/services/unit.service';
import { useWorkspaceContext } from '@app/context/workspace/context';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';

import { ReactComponent as TaskIcon } from '@images/task.svg';

const TYPE = BlockType.MentionTask;

interface TaskModuleProps {
  toggleSecondMenu: (name: BlockType) => void;
}

const MentionTaskModule = ({ toggleSecondMenu }: TaskModuleProps) => {
  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    toggleSecondMenu(TYPE);
  };

  return (
    <div
      onClick={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <TaskIcon className='[&>path]:stroke-text40' />
      Task
    </div>
  );
};

interface MenuProps {
  menu: string | null;
  callback: () => void;
}

const MentionTaskMenu = ({ menu, editorState, setEditorState, callback }: MenuProps & EditorProps) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const deferredFilter = useDeferredValue(searchValue);
  const { units } = useUnitsContext();
  const { activeWorkspace } = useWorkspaceContext();
  const { insertMentionBlock } = useInsertMention(editorState, setEditorState);
  const [tasksByBoard, setTasksByBoard] = useState<Record<string, Unit[]>>({});
  const [deletedUnits, setDeletedUnits] = useState<string[]>([]);

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    const fetchTasks = async () => {
      const taskBoards = units.filter((item) => item.type === 'task_board');
      const tasksPromises = taskBoards.map((board) => getTask(board.id).then((tasks) => ({ [board.id]: tasks })));
      const tasksResults = await Promise.all(tasksPromises);
      const tasks = tasksResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setTasksByBoard(tasks);
    };

    const fetchDeletedUnits = async () => {
      const deletedUnitsList = await getDeletedUnits(activeWorkspace?.id);
      setDeletedUnits(deletedUnitsList.map((unit: Unit) => unit.id));
    };

    fetchTasks();
    fetchDeletedUnits();
  }, [units]);

  const groupedItems = useMemo(() => {
    const filteredTasks: Record<string, Unit[]> = Object.keys(tasksByBoard).reduce((acc, boardId) => {
      const tasks = tasksByBoard[boardId].filter(
        (task) =>
          task.name !== '..,.status.,..' &&
          task.name.toLowerCase().includes(deferredFilter.toLowerCase()) &&
          !deletedUnits.includes(task.parentUnit?.id ?? ''),
      );
      return { ...acc, [boardId]: tasks };
    }, {});

    return units
      .filter((item) => item.type === 'task_board' && !deletedUnits.includes(item.parentUnit?.id ?? ''))
      .map((board) => ({
        ...board,
        tasks: filteredTasks[board.id] || [],
      }))
      .filter((board) => board.tasks.length > 0);
  }, [tasksByBoard, deferredFilter, units, deletedUnits]);

  const handleInsertTask = (task: Unit, parentUnitId: string | undefined) => {
    callback();

    insertMentionBlock({
      type: TYPE,
      text: task.name,
      url: `/workspace/${parentUnitId}`,
    });
  };

  if (menu !== TYPE) return null;

  return (
    <div className='secondMenu flex flex-col'>
      <div className='sticky top-0 bg-white z-10'>
        <SearchInput
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder='Task name'
        />
      </div>
      <div className='overflow-y-auto flex-1'>
        {groupedItems.length > 0 && (
          <>
            {groupedItems.map((board) => (
              <div key={board.id}>
                <div className='font-medium text-text40 text-xs2 mb-0.5 mt-2 uppercase'>{board.name}</div>
                <ul className='space-y-0.'>
                  {board.tasks.map((task) => (
                    <li
                      key={task.id}
                      className='p-2 text-sm3l cursor-pointer rounded-lg text-text70 hover:bg-background hover:text-text flex items-center gap-2'
                      onMouseDown={() => handleInsertTask(task, board.parentUnit?.id)}
                    >
                      <TaskIcon className='[&>path]:stroke-text40' />
                      {task.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

MentionTaskModule.Menu = MentionTaskMenu;

export default MentionTaskModule;
