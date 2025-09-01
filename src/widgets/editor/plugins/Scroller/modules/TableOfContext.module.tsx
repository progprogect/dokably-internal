import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import { EditorState } from 'draft-js';
import { ReactComponent as TableOfContentSVG } from '@images/tableofcontent.svg';

const TableOfContent = ({ setEditorState, callback }: EditorProps & any) => {
  const { toggleBlockType } = useBlockTypes();

  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setEditorState((editorState: EditorState) =>
      toggleBlockType(editorState, BlockType.TableOfContent),
    );
    callback();
  };

  return (
    <div
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <div className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'>
        <TableOfContentSVG className='[&>path]:stroke-text40' />
        Table of content
      </div>
    </div>
  );
};

export default TableOfContent;
