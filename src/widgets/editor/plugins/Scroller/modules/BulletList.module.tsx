import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import { ReactComponent as BulletListItem } from '@images/lists/bulletListItem.svg';
import { EditorState } from 'draft-js';
import { track } from '@amplitude/analytics-browser';

const BulletListModule = ({ setEditorState, callback }: EditorProps & any) => {
  const { toggleBlockType } = useBlockTypes();

  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    track('document_edit_style_selected', { path: 'slash', option: 'bullet' });
    setEditorState((editorState: EditorState) =>
      toggleBlockType(editorState, BlockType.BulletList),
    );
    callback();
  };

  return (
    <div
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <BulletListItem className='[&>path]:fill-text40' />
      Bulleted list
    </div>
  );
};

export default BulletListModule;
