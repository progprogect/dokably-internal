import cn from 'classnames';
import { useEditor } from '@tldraw/editor';
import { memo, useCallback, useMemo, useState } from 'react';
import { EMOJI_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { useSelectedShapes } from '@app/utils/whiteboard/useSelectedShapes';
import { EmojiPicker } from '@widgets/whiteboard/emoji-tool/EmojiPicker';
import { ReactComponent as EmojiIcon } from '@images/emoji-20.svg';
import { ReactComponent as EmojiBlue } from '@images/emoji-blue.svg';

const ChangeEmoji = () => {
  const [isOpen, setIsOpen] = useState(false);
  const editor = useEditor();

  const selectedShapes = useSelectedShapes();

  const areAllEmojiShapes = useMemo(
    () => selectedShapes.every((item) => item.type === EMOJI_SHAPE_ID),
    [selectedShapes],
  );

  const changeEmoji = useCallback(
    (emoji: string) => {
      const updatedShapes = selectedShapes.map((item) => ({
        ...item,
        props: {
          ...item.props,
          emoji,
        },
      }));

      editor.updateShapes(updatedShapes);
      setIsOpen(false);
    },
    [selectedShapes],
  );

  const handleClick = () => {
    setIsOpen((prevState) => !prevState);
  };

  if (!selectedShapes.length) return null;
  if (!areAllEmojiShapes) return null;

  return (
    <>
      <div className='pointer-events-auto relative flex items-center p-[8px]'>
        <div
          onClick={handleClick}
          className={cn(
            'flex items-center cursor-pointer rounded rounded-[var(--border-radius)]',
            {
              'bg-[#ECF0FB] text-fontBlue': isOpen,
              'hover:bg-[var(--background-gray-hover)]': !isOpen,
              'hover:text-[#29282C]': !isOpen,
            },
          )}
          style={{
            fontFamily: 'Euclid Circular A',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '17.75px',
            textAlign: 'center',
            textUnderlinePosition: 'from-font',
            textDecorationSkipInk: 'none',
          }}
        >
          {!isOpen && (
            <EmojiIcon
              className={cn(
                'icon w-[26px] h-[28px] p-[2.5px] cursor-pointer rounded-[var(--border-radius)] ',
              )}
            />
          )}
          {isOpen && (
            <EmojiBlue
              className={cn(
                'icon w-[26px] h-[28px] p-[2.5px] cursor-pointer rounded-[var(--border-radius)] ',
              )}
            />
          )}
          <span
            style={{
              padding: '5px 4px',
              width: 'auto',
              minWidth: '105px',
            }}
          >
            View all emojis
          </span>
        </div>
        {isOpen && (
          <div className='absolute left-[-40px] top-[48px] h-[132px] z-[var(--zIndexWhiteboard)] bg-[var(--white)] rounded-[var(--border-radius)] shadow-sh2'>
            <EmojiPicker callback={(emoji) => changeEmoji(emoji)} />
          </div>
        )}
      </div>
    </>
  );
};

export default memo(ChangeEmoji);
