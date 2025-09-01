import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { EditorBlock, EditorState } from 'draft-js';
import { Popover } from '@headlessui/react';
import cn from 'classnames';
import { usePopper } from 'react-popper';

import { EmojiPicker } from '@widgets/whiteboard/emoji-tool/EmojiPicker';
import useBlockData from '@app/hooks/editor/useBlockData';
import Placeholder from '@widgets/components/Placeholder';
import { getTab } from '@app/services/block.service';
import BannerDndWrapper from './BannerDndWrapper';

const BannerBlock = (props: any) => {
  const { block, blockProps } = props;
  const { store } = blockProps;
  const { setBlockDataValue } = useBlockData();

  const blockData = useMemo(() => block.getData(), [block]);
  const selectedEmoji = useMemo(() => blockData.get('state') || null, [blockData]);
  const blockDepth = useMemo(() => block.getDepth(), [block]);

  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);

  const blockRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const container = blockRef.current;
    if (!container) return;

    // Найти contentEditable элемент внутри EditorBlock
    const editableElement = container.querySelector('[contenteditable=true]');
    if (!editableElement) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    editableElement.addEventListener('focus', handleFocus);
    editableElement.addEventListener('blur', handleBlur);

    return () => {
      editableElement.removeEventListener('focus', handleFocus);
      editableElement.removeEventListener('blur', handleBlur);
    };
  }, []);

  const { styles: popperStyles, attributes: popperAttributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-start',
    modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
  });

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      const editorState = store.getItem('getEditorState')();
      const newState = setBlockDataValue(editorState, block, 'state', emoji);
      store.getItem('setEditorState')(EditorState.forceSelection(newState, editorState.getSelection()));
      setIsEmojiPickerOpen(false);
    },
    [store, block, setBlockDataValue],
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const hasText = block.getText().length > 0;

  return (
    <BannerDndWrapper
      block={block}
      store={store}
      setEditorState={store.getItem('setEditorState')}
      getEditorState={() => store.getItem('getEditorState')()}
      dndRef={containerRef}
    >
      <div
        className={cn(
          'dokably-banner-block__wrapper',
          'flex flex-row items-start relative group',
          'bg-[#ECF0FB] border border-transparent rounded-[4px]',
          'py-[12px] px-[12px] focus-within:border-[#4A86FF] focus-within:border-[1px]',
          { 'border-[#4A86FF] border-[1px]': isFocused },
        )}
        style={{ paddingLeft: getTab(blockDepth + 1) }}
      >
        <div
          className='flex flex-col items-start justify-start pt-[2px] mr-[8px] min-w-[28px]'
          contentEditable={false}
        >
          <Popover className='relative'>
            {({ close }) => (
              <>
                <Popover.Button
                  ref={setReferenceElement}
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                  className={cn('focus:outline-none')}
                  aria-label='Select emoji'
                >
                  <span className='text-[22px] leading-none select-none'>{selectedEmoji ? selectedEmoji : '💡'}</span>
                </Popover.Button>

                {isEmojiPickerOpen && (
                  <Popover.Panel
                    ref={setPopperElement}
                    style={popperStyles.popper}
                    {...popperAttributes.popper}
                    className='z-20'
                  >
                    <EmojiPicker
                      callback={(emoji) => {
                        handleEmojiSelect(emoji);
                        close();
                      }}
                    />
                  </Popover.Panel>
                )}
              </>
            )}
          </Popover>
        </div>

        <div className='flex-grow min-w-0 relative'>
          <Placeholder
            content='Type something...'
            isShow={!hasText}
            isSmall={false}
          />
          <div ref={blockRef}>
            <EditorBlock
              {...props}
              className='banner-text'
            />
          </div>
        </div>
      </div>
    </BannerDndWrapper>
  );
};

export default BannerBlock;
