import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as H } from '@images/h.svg';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import { EditorState } from 'draft-js';

const TextModule = ({ setEditorState, callback }: EditorProps & any) => {
  const { toggleBlockType } = useBlockTypes();

  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setEditorState((editorState: EditorState) =>
      toggleBlockType(editorState, BlockType.Text),
    );
    callback();
  };

  return (
    <div
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <H className='[&>path]:fill-text40' />
      Text
    </div>
  );
};

export default TextModule;
