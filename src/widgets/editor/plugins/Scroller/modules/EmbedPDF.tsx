import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { EditorState } from 'draft-js';
import { ReactComponent as Embed } from '@images/pdf.svg';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import useInlineStyles from '@app/hooks/editor/useInlineStyles';
import { track } from '@amplitude/analytics-browser';

const EmbedPDFModule = ({ setEditorState, callback }: EditorProps & any) => {
  const { toggleBlockType } = useBlockTypes();
  const { removeAllInlineStyles } = useInlineStyles();

  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    track('document_edit_embeds_selected', { option: 'pdf' });
    setEditorState((editorState: EditorState) => {
      editorState = removeAllInlineStyles(editorState);
      editorState = toggleBlockType(editorState, BlockType.EmbedPDF);
      return editorState;
    });
    callback();
  };

  return (
    <div
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <Embed className='[&>path]:stroke-text40' />
      PDF
    </div>
  );
};

export default EmbedPDFModule;
