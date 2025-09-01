import { ReactComponent as Kanban } from '@images/kanbanview.svg';

import { EditorState } from 'draft-js';
import { useParams } from 'react-router-dom';

import { useCreateTaskBoard } from '@app/hooks/useTaskBoard';
import { TASK_BOARD_ENTITY } from '../../blocks/TaskBoard/constants/task-board-entity-type';
import BlockType from '@entities/enums/BlockType';
import { createAtomicBlock } from '@app/hooks/editor/createAtomicBLock';
import { memo, useCallback } from 'react';

type KanbanModuleProps = {
  callback: (command: (editorState: EditorState) => EditorState) => void;
  setPluginIsAdding: (val: boolean) => void;
};

const KanbanModule = ({ callback, setPluginIsAdding }: KanbanModuleProps) => {
  const { createBoard } = useCreateTaskBoard();
  const { documentId, unitId } = useParams();

  const handleSelectTool = useCallback(
    async (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!documentId && !unitId) return;
      setPluginIsAdding(true);

      try {
        const boardType = BlockType.Kanban;
        const boardId = await createBoard(documentId ?? unitId ?? '');

        const command = (editorState: EditorState): EditorState => {
          return createAtomicBlock(TASK_BOARD_ENTITY, editorState, {
            boardType,
            boardId,
          });
        };
        callback(command);
      } catch {}
    },
    [callback, documentId, unitId, createBoard, setPluginIsAdding],
  );

  return (
    <div
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <Kanban className='[&>path]:stroke-text40' />
      Kanban view
    </div>
  );
};

export default memo(KanbanModule);
