import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as H1 } from '@images/h1.svg';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import { EditorState } from 'draft-js';
import { track } from '@amplitude/analytics-browser';

const Heading1Module = ({ setEditorState, callback }: EditorProps & any) => {
  const { toggleBlockType } = useBlockTypes();

  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    track('document_edit_style_selected', { path: 'slash', option: 'heading' });
    setEditorState((editorState: EditorState) =>
      toggleBlockType(editorState, BlockType.Heading1)
    );
    callback();
  };

  return (
    <div
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <H1 className='[&>path]:fill-text40' />
      Heading 1
    </div>
  );
};

export default Heading1Module;
