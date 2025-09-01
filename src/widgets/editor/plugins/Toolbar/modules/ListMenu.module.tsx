import BlockType from '@entities/enums/BlockType';
import { ReactComponent as BulletList } from '@images/lists/bulletList.svg';
import BulletListModule from './BulletList.module';
import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as NumberedList } from '@images/lists/numberedList.svg';
import NumberedListModule from './NumberedList.module';
import Tippy from '@tippyjs/react';
import { ReactComponent as ToggleList } from '@images/lists/toggleList.svg';
import ToggleListModule from './ToggleList.module';
import { useClickOutside } from '@app/hooks/useClickOutside';
import useContentBlock from '@app/hooks/editor/useContentBlock';

const ListMenuModule = (props: EditorProps) => {
  const { editorState } = props;
  const { ref, isVisible, setIsVisible } = useClickOutside<boolean>(null);
  const { getCurrentContentBlock } = useContentBlock();

  const handleShowToolPanel = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsVisible(!isVisible);
  };

  const handleOptionSelect = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsVisible(false);
  };

  const renderBlockTypesButton = (): JSX.Element => {
    let tooltip = 'List';
    let button = <BulletList />;
    let currentContentBlock = getCurrentContentBlock(editorState);
    let currentType = currentContentBlock.getType();
    if (currentType === BlockType.BulletList) {
      tooltip = 'Bulleted list';
      button = (
        <BulletList className='[&>circle]:fill-primaryHover [&>line]:stroke-primaryHover [&>path]:fill-primaryHover' />
      );
    } else if (currentType === BlockType.NumberedList) {
      tooltip = 'Numbered list';
      button = <NumberedList className='[&>path]:fill-primaryHover [&>line]:stroke-primaryHover' />;
    } else if (currentType === BlockType.Toggle) {
      tooltip = 'Toggle list';
      button = <ToggleList className='[&>path]:fill-primaryHover [&>line]:stroke-primaryHover' />;
    }
    return (
      <Tippy
        duration={0}
        content={tooltip}
        className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
      >
        {button}
      </Tippy>
    );
  };

  return (
    <div
      className='relative flex flex-col items-center justify-center'
      ref={ref}
    >
      <div
        className='flex items-center justify-center h-7 w-8 cursor-pointer hover:bg-background'
        onMouseDown={(event) => handleShowToolPanel(event)}
      >
        {renderBlockTypesButton()}
      </div>
      {isVisible && (
        <div className='flex justify-end absolute top-[36px] select-none'>
          <div className='mt-px p-2 bg-white rounded shadow-menu flex items-center w-fit gap-2'>
            <div onMouseDown={(event) => handleOptionSelect(event)}>
              <BulletListModule {...props} />
            </div>
            <div onMouseDown={(event) => handleOptionSelect(event)}>
              <NumberedListModule {...props} />
            </div>
            <div onMouseDown={(event) => handleOptionSelect(event)}>
              <ToggleListModule {...props} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListMenuModule;
