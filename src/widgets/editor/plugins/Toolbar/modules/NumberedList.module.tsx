import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as NumberedListItem } from '@images/lists/numberedListItem.svg';
import cn from 'classnames';
import useContentBlock from '@app/hooks/editor/useContentBlock';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import Tippy from '@tippyjs/react';
import { track } from '@amplitude/analytics-browser';

const NumberedListModule = (props: EditorProps) => {
  const { editorState, setEditorState } = props;
  const { getCurrentContentBlock } = useContentBlock();
  const { toggleBlockType } = useBlockTypes();

  let currentContentBlock = getCurrentContentBlock(editorState);
  let currentType = currentContentBlock.getType();

  const handleChange = (event: React.MouseEvent) => {
    event.preventDefault();
    track('document_edit_style_selected', { path: 'floating', option: 'numbered' });
    setEditorState((editorState) =>
      toggleBlockType(editorState, BlockType.NumberedList)
    );
  };

  return (
    <Tippy
      duration={0}
      
      content='Numbered list'
      className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
    >
      <div
        className='cursor-pointer hover:bg-background'
        onMouseDown={handleChange}
      >
        <NumberedListItem
          className={cn({
            '[&>path]:fill-primaryHover [&>line]:stroke-primaryHover':
              currentType === BlockType.NumberedList,
          })}
        />
      </div>
    </Tippy>
  );
};

export default NumberedListModule;
