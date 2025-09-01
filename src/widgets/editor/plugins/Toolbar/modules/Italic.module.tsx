import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as Italic } from '@images/italic.svg';
import useInlineStyles from '@app/hooks/editor/useInlineStyles';
import { track } from '@amplitude/analytics-browser';
import ToolbarIconButton from '@features/editor/ToolbarIconButton';

const ItalicModule = (props: EditorProps) => {
  const { editorState, setEditorState } = props;
  const { toggleInlineStyle } = useInlineStyles();

  const handleInlineStyle = (event: React.MouseEvent) => {
    track('document_edit_style_selected', { path: 'floating', option: 'cursive' });
    setEditorState(toggleInlineStyle(editorState, 'ITALIC', event));
  };

  const isActive = editorState.getCurrentInlineStyle().has('ITALIC')

  return (
    <ToolbarIconButton onMouseDown={handleInlineStyle} isActive={isActive} tooltipContent='Italic'>
      <Italic />
    </ToolbarIconButton>
  )
};

export default ItalicModule;
