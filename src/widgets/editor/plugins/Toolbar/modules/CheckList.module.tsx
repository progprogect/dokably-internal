import BlockType from '@entities/enums/BlockType';
import { ReactComponent as Checklist } from '@images/checklist.svg';
import { EditorProps } from '@entities/props/Editor.props';
import cn from 'classnames';
import useContentBlock from '@app/hooks/editor/useContentBlock';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import Tippy from '@tippyjs/react';
import { track } from '@amplitude/analytics-browser';

const CheckListModule = (props: EditorProps) => {
  const { editorState, setEditorState } = props;
  const { getCurrentContentBlock } = useContentBlock();
  const { toggleBlockType } = useBlockTypes();

  let currentContentBlock = getCurrentContentBlock(editorState);
  let currentType = currentContentBlock.getType();

  const handleChange = (event: React.MouseEvent) => {
    event.preventDefault();
    track('document_edit_style_selected', { path: 'floating', option: 'checklist' });
    setEditorState((editorState) =>
      toggleBlockType(editorState, BlockType.CheckList)
    );
  };

  return (
    <Tippy
      duration={0}
      
      content='Checklist'
      className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
    >
      <div
        className='flex items-center justify-center h-7 w-8 cursor-pointer hover:bg-background'
        onMouseDown={handleChange}
      >
        <Checklist
          className={cn({
            '[&>path]:stroke-primaryHover [&>line]:stroke-primaryHover':
              currentType === BlockType.CheckList,
          })}
        />
      </div>
    </Tippy>
  );
};

export default CheckListModule;
