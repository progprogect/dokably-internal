import Tippy from '@tippyjs/react';
import cn from 'classnames';
import { ReactComponent as Cursor } from '@icons/cursor.svg';
import { useEditor, useValue } from '@tldraw/editor';
import { useTools } from '@tldraw/tldraw';

const SelectTool = () => {
  const editor = useEditor();
  const tools = useTools();
  const activeTool = useValue('activeTool', () => editor.getCurrentToolId(), [
    editor,
  ]);

  const handleClick = () => {
    tools['select'].onSelect('toolbar');
  }

  return (
    <Tippy
      duration={0}
      content='Select'
      className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
    >
      <div className='pointer-events-auto relative flex items-center'>
        <Cursor
          className={cn(
            'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
            {
              'bg-[var(--background-gray-hover)]': activeTool === 'select',
            }
          )}
          onClick={handleClick}
        />
      </div>
    </Tippy>
  );
};

export default SelectTool;
