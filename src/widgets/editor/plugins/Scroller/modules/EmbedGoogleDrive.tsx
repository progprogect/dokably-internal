import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { EditorState } from 'draft-js';
import { ReactComponent as GoogleDrive } from '@images/google-drive-embed.svg';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import useInlineStyles from '@app/hooks/editor/useInlineStyles';
import { track } from '@amplitude/analytics-browser';

const EmbedGoogleDriveModule = ({
  setEditorState,
  callback,
}: EditorProps & any) => {
  const { toggleBlockType } = useBlockTypes();
  const { removeAllInlineStyles } = useInlineStyles();

  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    track('document_edit_embeds_selected', { option: 'googleDrive' });
    setEditorState((editorState: EditorState) => {
      editorState = removeAllInlineStyles(editorState);
      editorState = toggleBlockType(editorState, BlockType.EmbedGoogleDrive);
      return editorState;
    });
    callback();
  };

  return (
    <div
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <GoogleDrive className='[&>path]:stroke-text40' />
      Google Drive
    </div>
  );
};

export default EmbedGoogleDriveModule;
