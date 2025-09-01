import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as H2 } from '@images/h2.svg';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import { EditorState } from 'draft-js';
import { track } from '@amplitude/analytics-browser';

const Heading2Module = ({
  setEditorState,
  callback,
}: EditorProps & any) => {
  const { toggleBlockType } = useBlockTypes();

  const handleSelectTool = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    track('document_edit_style_selected', { path: 'slash', option: 'heading2' });
    setEditorState((editorState: EditorState) =>
      toggleBlockType(editorState, BlockType.Heading2)
    );
    callback();
  };

  return (
    <div
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <H2 className='[&>path]:fill-text40' />
      Heading 2
    </div>
  );
};

export default Heading2Module;
