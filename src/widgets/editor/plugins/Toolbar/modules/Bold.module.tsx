import { ReactComponent as Bold } from '@images/bold.svg';
import { EditorProps } from '@entities/props/Editor.props';
import useInlineStyles from '@app/hooks/editor/useInlineStyles';
import { track } from '@amplitude/analytics-browser';
import ToolbarIconButton from '@features/editor/ToolbarIconButton/ToolbarIconButton';

const BoldModule = (props: EditorProps) => {
  const { editorState, setEditorState } = props;
  const { toggleInlineStyle } = useInlineStyles();

  const handleInlineStyle = (event: React.MouseEvent) => {
    track('document_edit_style_selected', { path: 'floating', option: 'BOLD' });
    setEditorState(toggleInlineStyle(editorState, 'BOLD', event));
  };

  const isActive = editorState.getCurrentInlineStyle().has('BOLD')

  return (
    <ToolbarIconButton onMouseDown={handleInlineStyle} isActive={isActive} tooltipContent='Bold'>
      <Bold />
    </ToolbarIconButton>
  )
};

export default BoldModule;
