import Tippy from '@tippyjs/react';
import cn from 'classnames';
import { ReactComponent as Redo } from '@icons/redo.svg';
import { useEditor } from '@tldraw/editor';

const RedoTool = () => {
  const editor = useEditor();

  const handleClick = () => {
    editor.redo();
  };

  return (
    <Tippy
      duration={0}
      content='Redo'
      className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
    >
      <div className='pointer-events-auto relative flex items-center'>
        <Redo
          className={cn(
            'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]'
          )}
          onClick={handleClick}
        />
      </div>
    </Tippy>
  );
};

export default RedoTool;
