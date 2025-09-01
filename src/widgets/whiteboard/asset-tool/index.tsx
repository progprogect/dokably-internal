import cn from 'classnames';

import { ReactComponent as Upload } from '@icons/upload.svg';
import { ReactComponent as Computer } from '@icons/computer.svg';
import { ReactComponent as Link } from '@images/link.svg';
import { useEditor, useValue } from '@tldraw/editor';
import Tippy from '@tippyjs/react';
import { useTools } from '@tldraw/tldraw';

const AssetsTool = () => {
  const editor = useEditor();
  const tools = useTools();
  const activeTool = useValue('activeTool', () => editor.getCurrentToolId(), [
    editor,
  ]);

  const handleClick = () => {
    tools['asset'].onSelect('toolbar');
  };

  return (
    <Tippy
      duration={0}
      content='Assets'
      className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
    >
      <div className='pointer-events-auto relative flex items-center'>
        <Upload
          className={cn(
            'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
            {
              'bg-[var(--background-gray-hover)]': activeTool === 'asset',
            }
          )}
          onClick={handleClick}
        />
      </div>
    </Tippy>
  );
};

export default AssetsTool;
