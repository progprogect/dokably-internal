import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as Strikethrough } from '@images/strikethrough.svg';
import useInlineStyles from '@app/hooks/editor/useInlineStyles';
import { track } from '@amplitude/analytics-browser';
import ToolbarIconButton from '@features/editor/ToolbarIconButton';

const StrikethroughModule = (props: EditorProps) => {
  const { editorState, setEditorState } = props;
  const { toggleInlineStyle } = useInlineStyles();

  const handleInlineStyle = (event: React.MouseEvent) => {
    track('document_edit_style_selected', { path: 'floating', option: 'strike_throught' });
    setEditorState(toggleInlineStyle(editorState, 'STRIKETHROUGH', event));
  };

  const isActive = editorState.getCurrentInlineStyle().has('STRIKETHROUGH')

  return (
    <ToolbarIconButton onMouseDown={handleInlineStyle} isActive={isActive} tooltipContent='Strikethrough'>
      <Strikethrough />
    </ToolbarIconButton>
  )
};

export default StrikethroughModule;
