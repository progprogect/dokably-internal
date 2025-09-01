import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import { ReactComponent as Checklist } from '@images/checklist.svg';
import { EditorState } from 'draft-js';
import { track } from '@amplitude/analytics-browser';

const CheckListModule = ({ setEditorState, callback }: EditorProps & any) => {
  const { toggleBlockType } = useBlockTypes();

  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    track('document_edit_style_selected', {
      path: 'slash',
      option: 'checklist',
    });
    setEditorState((editorState: EditorState) =>
      toggleBlockType(editorState, BlockType.CheckList),
    );
    callback();
  };

  return (
    <div
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <Checklist />
      Check list
    </div>
  );
};

export default CheckListModule;
