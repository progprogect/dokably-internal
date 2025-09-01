import BlockType from '@entities/enums/BlockType';
import { ReactComponent as BulletListItem } from '@images/lists/bulletListItem.svg';
import { EditorProps } from '@entities/props/Editor.props';
import cn from 'classnames';
import useContentBlock from '@app/hooks/editor/useContentBlock';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import Tippy from '@tippyjs/react';
import { track } from '@amplitude/analytics-browser';

const BulletListModule = (props: EditorProps) => {
  const { editorState, setEditorState } = props;
  const { getCurrentContentBlock } = useContentBlock();
  const { toggleBlockType } = useBlockTypes();

  let currentContentBlock = getCurrentContentBlock(editorState);
  let currentType = currentContentBlock.getType();

  const handleChange = (event: React.MouseEvent) => {
    event.preventDefault();
    track('document_edit_style_selected', { path: 'floating', option: 'bullet' });
    setEditorState((editorState) =>
      toggleBlockType(editorState, BlockType.BulletList)
    );
  };

  return (
    <Tippy
      duration={0}
      content='Bulleted list'
      className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
    >
      <div
        className='cursor-pointer hover:bg-background'
        onMouseDown={handleChange}
      >
        <BulletListItem
          className={cn({
            '[&>circle]:fill-primaryHover [&>line]:stroke-primaryHover':
              currentType === BlockType.BulletList,
          })}
        />
      </div>
    </Tippy>
  );
};

export default BulletListModule;
