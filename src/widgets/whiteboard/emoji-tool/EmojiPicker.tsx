import Picker from '@emoji-mart/react';
import './Emoji.style.css';
import { useEffect, useRef } from 'react';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';

interface EmojiMenuProps {
  callback: (emoji: any) => void;
}

export const EmojiPicker = ({ callback }: EmojiMenuProps) => {
  const handleEmojiSelect = (emoji: any) => {
    callback(emoji.native);
  };

  // Безопасное использование DokablyEditor контекста
  let setReadOnly: ((readonly: boolean) => void) | null = null;
  
  try {
    const context = useDokablyEditor();
    setReadOnly = context.setReadOnly;
  } catch (error) {
    // В whiteboard контексте DokablyEditor недоступен - это нормально
    console.debug('EmojiPicker: DokablyEditor context not available (whiteboard mode)');
  }

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Только если setReadOnly доступен (текстовый редактор)
    if (setReadOnly && typeof setReadOnly === 'function') {
      setReadOnly(true);
      
      return () => {
        setReadOnly?.(false);
      };
    }
    // В whiteboard не нужен readonly control
  }, [setReadOnly]);

  return (
    <div
      ref={ref}
      className='pointer-events-auto'
    >
      <Picker
        onEmojiSelect={handleEmojiSelect}
        theme='light'
        perLine={8}
        emojiButtonSize={34}
        emojiSize={24}
        emojiButtonRadius='4px'
        className='custom-emoji-picker'
        navPosition='none'
        previewPosition='none'
        skinTonePosition='none'
        maxFrequentRows={2}
        autoFocus
      />
    </div>
  );
};
