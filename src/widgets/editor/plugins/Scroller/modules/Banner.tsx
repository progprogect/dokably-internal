import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { EditorState } from 'draft-js';
import { ReactComponent as Logo } from '@images/banner.svg';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import useInlineStyles from '@app/hooks/editor/useInlineStyles';


const BannerModule = ({ setEditorState, callback }: EditorProps & any) => {
  const { toggleBlockType } = useBlockTypes();
  const { removeAllInlineStyles } = useInlineStyles();

  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setEditorState((editorState: EditorState) => {
      editorState = removeAllInlineStyles(editorState);
      editorState = toggleBlockType(editorState, BlockType.Banner);
      return editorState;
    });
    callback();
  };

  return (
    <div
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <Logo className='[&>path]:stroke-text40' />
      Banner
    </div>
  );
};

export default BannerModule;
