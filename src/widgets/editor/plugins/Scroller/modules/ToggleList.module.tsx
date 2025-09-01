import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import { ReactComponent as ToggleListItem } from '@images/lists/toggleListItem.svg';
import { EditorState } from 'draft-js';
import { track } from '@amplitude/analytics-browser';

const ToggleListModule = ({ setEditorState, callback }: EditorProps & any) => {
  const { toggleBlockType } = useBlockTypes();

  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    track('document_edit_style_selected', { path: 'slash', option: 'toggle' });
    setEditorState((editorState: EditorState) =>
      toggleBlockType(editorState, BlockType.Toggle),
    );
    callback();
  };

  return (
    <div
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <ToggleListItem />
      Toggle list
    </div>
  );
};

export default ToggleListModule;
