import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as H2 } from '@images/h2.svg';
import cn from 'classnames';
import useContentBlock from '@app/hooks/editor/useContentBlock';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import Tippy from '@tippyjs/react';
import { track } from '@amplitude/analytics-browser';

const Heading2Module = (props: EditorProps) => {
  const { editorState, setEditorState } = props;
  const { getCurrentContentBlock } = useContentBlock();

  const { toggleBlockType } = useBlockTypes();

  let currentContentBlock = getCurrentContentBlock(editorState);
  let currentType = currentContentBlock.getType();

  const handleChange = (event: React.MouseEvent) => {
    event.preventDefault();
    track('document_edit_style_selected', { path: 'floating', option: 'heading2' });
    setEditorState((editorState) =>
      toggleBlockType(editorState, BlockType.Heading2)
    );
  };

  return (
    <Tippy
      duration={0}
      
      content='Heading 2'
      className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
    >
      <div
        className='cursor-pointer hover:bg-background'
        onMouseDown={handleChange}
      >
        <H2
          className={cn({
            '[&>path]:fill-primaryHover': currentType === BlockType.Heading2,
          })}
        />
      </div>
    </Tippy>
  );
};

export default Heading2Module;
