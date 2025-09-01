import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import Heading1Module from './Heading1.module';
import Heading2Module from './Heading2.module';
import Heading3Module from './Heading3.module';
import TextModule from './Text.module';
import { ReactComponent as TextStyle } from '@images/textStyle.svg';
import { ReactComponent as TextStyleH1 } from '@images/textStyleH1.svg';
import { ReactComponent as TextStyleH2 } from '@images/textStyleH2.svg';
import { ReactComponent as TextStyleH3 } from '@images/textStyleH3.svg';
import { useClickOutside } from '@app/hooks/useClickOutside';
import useContentBlock from '@app/hooks/editor/useContentBlock';
import Tippy from '@tippyjs/react';

const TextHeadingModule = (props: EditorProps) => {
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
    let tooltip = 'Text style';
    let button = <TextStyle />;
    let currentContentBlock = getCurrentContentBlock(editorState);
    let currentType = currentContentBlock.getType();
    if (currentType === BlockType.Heading1) {
      button = (
        <TextStyleH1 className='[&>circle]:fill-primaryHover [&>line]:stroke-primaryHover [&>path]:fill-primaryHover' />
      );
    } else if (currentType === BlockType.Heading2) {
      button = <TextStyleH2 className='[&>path]:fill-primaryHover [&>line]:stroke-primaryHover' />;
    } else if (currentType === BlockType.Heading3) {
      button = <TextStyleH3 className='[&>path]:fill-primaryHover [&>line]:stroke-primaryHover' />;
    }
    return (
      <Tippy
        duration={0}
        content={tooltip}
        className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
      >
        <div className='flex items-center justify-center h-7 w-8 cursor-pointer hover:bg-background'>{button}</div>
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
              <TextModule {...props} />
            </div>
            <div onMouseDown={(event) => handleOptionSelect(event)}>
              <Heading1Module {...props} />
            </div>
            <div onMouseDown={(event) => handleOptionSelect(event)}>
              <Heading2Module {...props} />
            </div>
            <div onMouseDown={(event) => handleOptionSelect(event)}>
              <Heading3Module {...props} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextHeadingModule;
