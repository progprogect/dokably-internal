import Tippy from '@tippyjs/react';
import cn from 'classnames';
import { ReactComponent as Frame } from '@icons/frame.svg';
import { useEditor, useValue } from '@tldraw/editor';
import { useTools } from '@tldraw/tldraw';

const FrameTool = () => {
  const editor = useEditor();
  const tools = useTools();
  const activeTool = useValue('activeTool', () => editor.getCurrentToolId(), [
    editor,
  ]);

  const handleClick = () => {
    tools['frame'].onSelect('toolbar');
  }

  return (
    <Tippy
      duration={0}
      content='Frame'
      className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
    >
      <div className='pointer-events-auto relative flex items-center'>
        <Frame
          className={cn(
            'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
            {
              'bg-[var(--background-gray-hover)]': activeTool === 'frame',
            }
          )}
          onClick={handleClick}
        />
      </div>
    </Tippy>
  );
};

export default FrameTool;
