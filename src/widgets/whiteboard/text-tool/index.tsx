import cn from 'classnames';
import { ReactComponent as Text } from '@icons/text.svg';
import { DokablyFill } from '@app/constants/whiteboard/whiteboard-styles';
import { useEditor, useValue } from '@tldraw/editor';
import Tippy from '@tippyjs/react';
import { useTools, useUiEvents } from '@tldraw/tldraw';
import { CUSTOM_TEXT_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

const TextTool = () => {
  const editor = useEditor();
  const tools = useTools();
  const trackEvent = useUiEvents();
  const activeTool = useValue('activeTool', () => editor.getCurrentToolId(), [
    editor,
  ]);

  const handleClick = () => {
    tools[CUSTOM_TEXT_SHAPE_ID] = {
      id: CUSTOM_TEXT_SHAPE_ID,
      icon: 'tool-text',
      label: 'tool.text' as any,
      kbd: 't',
      readonlyOk: false,
      onSelect: (source) => {
        editor.selectNone();
        editor.setStyleForNextShapes(DokablyFill, '#29282C');
        editor.setCurrentTool(CUSTOM_TEXT_SHAPE_ID);
        trackEvent('select-tool', { source, id: 'text' });
      },
    };

    tools[CUSTOM_TEXT_SHAPE_ID].onSelect('toolbar');
  };

  return (
    <Tippy
      duration={0}
      content='Text'
      className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
    >
      <div className='pointer-events-auto relative flex items-center'>
        <Text
          className={cn(
            'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
            {
              'bg-[var(--background-gray-hover)]': activeTool === CUSTOM_TEXT_SHAPE_ID,
            }
          )}
          onClick={handleClick}
        />
      </div>
    </Tippy>
  );
};

export default TextTool;
