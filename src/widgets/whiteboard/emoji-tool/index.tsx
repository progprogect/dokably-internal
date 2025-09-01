import cn from 'classnames';
import { useEditor, useValue } from '@tldraw/editor';
import { DocablyBgColor } from '@app/constants/whiteboard/whiteboard-styles';
import { useClickOutside } from '@app/hooks/useClickOutside';
import Tippy from '@tippyjs/react';
import { memo } from 'react';
import { TLUiTranslationKey, useTools } from '@tldraw/tldraw';
import { ReactComponent as EmojiIcon } from '@images/emoji-tool-whiteboard-icon.svg';
import {
  EMOJI_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import { EmojiPicker } from './EmojiPicker';

const EmojiTool = () => {
  const editor = useEditor();
  const tools = useTools();

  const activeTool = useValue('activeTool', () => editor.getCurrentToolId(), [
    editor,
  ]);

  const {
    ref,
    isVisible: isOpen,
    setIsVisible: setOpen,
  } = useClickOutside(false);

  const handleClick = () => {
    const selection = document.getSelection();
    selection?.empty()
    setOpen(!isOpen);
  };

  const createShape = (emoji: string) => {
    tools[EMOJI_SHAPE_ID] = {
      id: EMOJI_SHAPE_ID,
      icon: 'color',
      label: `tools.${EMOJI_SHAPE_ID}` as TLUiTranslationKey,
      kbd: 'n,r',
      readonlyOk: false,
      onSelect: (source) => {
        localStorage.setItem('emoji', emoji)
        editor.selectNone();
        editor.setStyleForNextShapes(
          DocablyBgColor,
          DocablyBgColor.defaultValue,
        );
        editor.setCurrentTool(EMOJI_SHAPE_ID);
      },
    };
    tools[EMOJI_SHAPE_ID].onSelect('toolbar');
    setOpen(false);
  };

  return (
    <>
      <Tippy
        duration={0}
        content={isOpen ? '' : 'Emoji'}
        className={
          isOpen
            ? ''
            : '!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
        }
      >
        <div
          ref={ref}
          className='pointer-events-auto relative flex items-center'
        >
          <div
            onClick={handleClick}
            className='flex items-center py-1 gap-2 cursor-pointer rounded'
          >
            <EmojiIcon
              className={cn(
                'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
                {
                  'bg-[var(--background-gray-hover)]': activeTool === EMOJI_SHAPE_ID,
                }
              )}
            />
          </div>

          {isOpen && (
            <div className='absolute left-[44px] h-[132px] z-[var(--zIndexWhiteboard)] bg-[var(--white)] rounded-[var(--border-radius)] shadow-sh2'>
              <EmojiPicker callback={(emoji) => createShape(emoji)} />
            </div>
          )}
        </div>
      </Tippy>
    </>
  );
};

export default memo(EmojiTool);
