import BlockType from '@entities/enums/BlockType';
import { ReactComponent as TableView } from '@icons/table-view.svg';
import { EditorState } from 'draft-js';
import { useParams } from 'react-router-dom';

import { useCreateTaskBoard } from '@app/hooks/useTaskBoard';
import { createAtomicBlock } from '@app/hooks/editor/createAtomicBLock';
import { TASK_BOARD_ENTITY } from '../../blocks/TaskBoard/constants/task-board-entity-type';

type TableViewModuleProps = {
  callback: (command: (editorState: EditorState) => EditorState) => void;
  setPluginIsAdding: (val: boolean) => void;
};

const TableViewModule = ({ callback, setPluginIsAdding }: TableViewModuleProps) => {
  const { createBoard } = useCreateTaskBoard();
  const { documentId } = useParams();

  const handleSelectTool = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    if (!documentId) return;
    setPluginIsAdding(true);

    const boardId = await createBoard(documentId);
    const command = (editorState: EditorState): EditorState => {
      return createAtomicBlock(TASK_BOARD_ENTITY, editorState, {
        boardId,
        boardType: BlockType.TableView,
      });
    };

    callback(command);
  };

  return (
    <button
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2  hover:bg-background cursor-pointer rounded'
      type='button'
    >
      <TableView className='text-text40' />
      Table view
    </button>
  );
};

export default TableViewModule;
