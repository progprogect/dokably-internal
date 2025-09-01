import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as Underline } from '@images/underline.svg';
import useInlineStyles from '@app/hooks/editor/useInlineStyles';
import { track } from '@amplitude/analytics-browser';
import ToolbarIconButton from '@features/editor/ToolbarIconButton';

const UnderlineModule = (props: EditorProps) => {
  const { editorState, setEditorState } = props;
  const { toggleInlineStyle } = useInlineStyles();

  const handleInlineStyle = (event: React.MouseEvent) => {
    track('document_edit_style_selected', { path: 'floating', option: 'UNDERLINE' });
    setEditorState(toggleInlineStyle(editorState, 'UNDERLINE', event));
  };

  const isActive = editorState.getCurrentInlineStyle().has('UNDERLINE')

  return (
    <ToolbarIconButton onMouseDown={handleInlineStyle} isActive={isActive} tooltipContent='Underline'>
      <Underline />
    </ToolbarIconButton>
  )
};

export default UnderlineModule;
