import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as EmojiIcon } from '@images/emoji.svg';
import Picker from '@emoji-mart/react';
import useInsertMention from '@app/hooks/editor/useInsertMention';
import './Emoji.style.css';

const TYPE = BlockType.Emoji;

interface EmojiModuleProps {
  toggleSecondMenu: (name: string) => void;
}

const EmojiModule = ({ toggleSecondMenu }: EmojiModuleProps) => {
  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    toggleSecondMenu(TYPE);
  };

  return (
    <div
      onClick={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <EmojiIcon className='[&>path]:stroke-text40' />
      Emoji
    </div>
  );
};

interface EmojiMenuProps {
  menu: string | null;
  callback: () => void;
}

const EmojiMenu = ({ menu, editorState, setEditorState, callback }: EmojiMenuProps & EditorProps) => {
  const { insertText } = useInsertMention(editorState, setEditorState);

  const handleEmojiSelect = (emoji: any) => {
    callback();
    insertText(emoji.native);
  };

  if (menu !== TYPE) return null;

  return (
    <div className='pointer-events-auto'>
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
      />
    </div>
  );
};

EmojiModule.Menu = EmojiMenu;

export default EmojiModule;
