import { ReactComponent as Code } from '@images/code.svg';
import { EditorProps } from '@entities/props/Editor.props';
import cn from 'classnames';
import useInlineStyles from '@app/hooks/editor/useInlineStyles';
import Tippy from '@tippyjs/react';
import { track } from '@amplitude/analytics-browser';

const CodeModule = (props: EditorProps) => {
  const { editorState, setEditorState } = props;
  const { toggleInlineStyle } = useInlineStyles();

  const handleInlineStyle = (event: React.MouseEvent) => {
    track('document_edit_style_selected', { path: 'floating', option: 'code' });
    setEditorState(toggleInlineStyle(editorState, 'code', event));
  };

  return (
    <Tippy
      duration={0}
      content='Inline code'
      className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
    >
      <div
        onMouseDown={handleInlineStyle}
        className='flex items-center justify-center h-7 w-8 cursor-pointer hover:bg-background'
      >
        <Code
          className={cn({
            '[&>path]:stroke-primaryHover': editorState
              .getCurrentInlineStyle()
              .has('code'),
          })}
        />
      </div>
    </Tippy>
  );
};

export default CodeModule;
