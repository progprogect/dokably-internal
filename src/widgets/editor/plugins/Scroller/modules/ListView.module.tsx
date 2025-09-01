import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as List } from '@images/listview.svg';
import { EditorState } from 'draft-js';
import { useParams } from 'react-router-dom';

import { useCreateTaskBoard } from '@app/hooks/useTaskBoard';
import { TASK_BOARD_ENTITY } from '../../blocks/TaskBoard/constants/task-board-entity-type';
import { createAtomicBlock } from '@app/hooks/editor/createAtomicBLock';

const ListViewModule = ({ callback, setPluginIsAdding }: EditorProps & any) => {
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
        boardType: BlockType.ListView,
      });
    };

    callback(command);
  };

  return (
    <button
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
      type='button'
    >
      <List className='[&>path]:stroke-text40' />
      List view
    </button>
  );
};

export default ListViewModule;
