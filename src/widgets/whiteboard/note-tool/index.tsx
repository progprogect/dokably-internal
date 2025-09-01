import cn from 'classnames';

import { ReactComponent as Note } from '@icons/note.svg';
import { useEditor, useValue } from '@tldraw/editor';
import { DokablyNoteBgColor } from '@app/constants/whiteboard/whiteboard-styles';
import { useClickOutside } from '@app/hooks/useClickOutside';
import Tippy from '@tippyjs/react';
import { useTools } from '@tldraw/tldraw';
import { CUSTOM_NOTE_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

const NoteTool = () => {
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
    setOpen(!isOpen);
  };

  const createNote = (bgColor: string) => {
    tools[CUSTOM_NOTE_SHAPE_ID] = {
      id: CUSTOM_NOTE_SHAPE_ID,
      icon: 'color',
      label: 'Custom note' as any,
      kbd: 'n,r',
      readonlyOk: false,
      onSelect: () => {
        editor.selectNone();
        editor.setStyleForNextShapes(DokablyNoteBgColor, bgColor);
        editor.setCurrentTool(CUSTOM_NOTE_SHAPE_ID);
      },
    };
    tools[CUSTOM_NOTE_SHAPE_ID].onSelect('toolbar');
    setOpen(false);
  };

  return (
    <Tippy
      duration={0}
      content={isOpen ? '' : 'Note'}
      className={
        isOpen
          ? ''
          : '!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
      }
    >
      <div ref={ref} className='pointer-events-auto relative flex items-center'>
        <Note
          className={cn(
            'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
            {
              'bg-[var(--background-gray-hover)]':
                isOpen || activeTool === CUSTOM_NOTE_SHAPE_ID,
            }
          )}
          onClick={handleClick}
        />
        {isOpen && (
          <div className='absolute flex flex-wrap gap-[8px] left-[44px] w-[80px] p-[10px] h-[250px] z-[var(--zIndexWhiteboard)] bg-[var(--white)] rounded-[var(--border-radius)] shadow-sh2 items-center justify-center flex-col'>
            {DokablyNoteBgColor.values.map((color: string, index: number) => (
              <div key={`note-color-${index}`} className='group'>
                <Note
                  style={{
                    //@ts-ignore
                    '--icon-fill': color,
                    '--stroke':
                      'color-mix(in srgb, var(--icon-fill) 60%, var(--text60))',
                    '--hover-stroke':
                      'color-mix(in srgb, var(--icon-fill) 40%, var(--text60))',
                  }}
                  className={cn(
                    'icon w-[26px] h-[26px] cursor-pointer',
                    `fill-[var(--icon-fill)]`,
                    `[&>path]:stroke-[var(--stroke)]`,
                    'group-hover:[&>path]:stroke-[var(--hover-stroke)]'
                  )}
                  onClick={() => createNote(color)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Tippy>
  );
};

export default NoteTool;
