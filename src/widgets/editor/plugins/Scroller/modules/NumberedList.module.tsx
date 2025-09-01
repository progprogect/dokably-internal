import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import { ReactComponent as NumberedListItem } from '@images/lists/numberedListItem.svg';
import { EditorState } from 'draft-js';
import { track } from '@amplitude/analytics-browser';

const NumberedListModule = ({
  setEditorState,
  callback,
}: EditorProps & any) => {
  const { toggleBlockType } = useBlockTypes();

  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    track('document_edit_style_selected', {
      path: 'slash',
      option: 'numbered',
    });
    setEditorState((editorState: EditorState) =>
      toggleBlockType(editorState, BlockType.NumberedList),
    );
    callback();
  };

  return (
    <div
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <NumberedListItem className='[&>path]:fill-text40' />
      Numbered List
    </div>
  );
};

export default NumberedListModule;
