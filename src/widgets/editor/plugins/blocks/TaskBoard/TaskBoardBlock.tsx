import { TaskBoardProvider } from '@widgets/task-board/task-board-context';
import TaskBoard from '@widgets/task-board/task-board';
import { Unit } from '@entities/models/unit';
import { removeUnit, renameUnit } from '@app/redux/features/unitsSlice';
import { useDispatch } from 'react-redux';
import { ContentBlock, EditorState } from 'draft-js';
import { TaskBoardView } from '@widgets/task-board/types';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { useAtomicBlock } from '@app/hooks/editor/useAtomicBlock';
import { TASK_BOARD_ENTITY } from './constants/task-board-entity-type';
import BlockType from '@entities/enums/BlockType';
import { PluginBlockPropsToRender, PluginProps } from '../../types';

type TaskBoardBlockProps = {
  block: ContentBlock;
  editorState: EditorState;
  setEditorState: (editorState: EditorState) => EditorState;
};

type BlockProps = PluginProps<TaskBoardBlockProps & PluginBlockPropsToRender> & { readonly?: boolean };

type TaskBoardEntityMetadata = {
  boardId?: string;
  boardType: BlockType.Kanban | BlockType.TableView | BlockType.ListView;
};

const TaskBoardBlock = (props: BlockProps) => {
  const taskboardBlockActions = useAtomicBlock<TaskBoardEntityMetadata>({
    entityType: TASK_BOARD_ENTITY,
    editorState: props.blockProps.editorState,
    setEditorState: props.blockProps.setEditorState,
    block: props.block,
    contentState: props.contentState,
  });

  const dispatch = useDispatch();
  const { setReadOnly } = useDokablyEditor();
  const { ref } = useClickOutside(false, () => setReadOnly(false));

  const entityData = taskboardBlockActions.getEntityData();

  const handleCopyBoard = (unit: Unit) => {
    console.log(unit, entityData);
    const board = `${unit.type}:${entityData?.boardType}:${entityData?.boardId}`;
    navigator.clipboard.writeText(board);
  };

  const handleDeleteBoard = (unit: Unit) => {
    dispatch(removeUnit(unit));
    taskboardBlockActions.removeBlock()
  };

  const handleChangeView = (view: TaskBoardView) => {
    if (!entityData) return;
    taskboardBlockActions.setEntityData({ ...entityData, boardType: view });
  };

  const handleRenameBoard = (unit: Unit) => {
    dispatch(renameUnit(unit));
  };

  if (!entityData?.boardId) return <div>No task board found</div>;

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        setReadOnly(true);
      }}
      onMouseDown={() => setReadOnly(true)}
      contentEditable={false}
    >
      <TaskBoardProvider id={entityData.boardId}>
        <TaskBoard
          view={entityData.boardType}
          onCopy={handleCopyBoard}
          onDelete={handleDeleteBoard}
          onChangeView={handleChangeView}
          onRenameBoard={handleRenameBoard}
        />
      </TaskBoardProvider>
    </div>
  );
};

export default TaskBoardBlock;
