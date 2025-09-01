import cn from 'classnames';
import { ReactComponent as Line } from '@icons/line.svg';
import { ReactComponent as Arrow } from '@icons/arrow.svg';
import { ReactComponent as ArrowSquare } from '@icons/arrow-square.svg';
import { ReactComponent as ArrowStrictSquare } from '@icons/arrow-strict-square.svg';

import { useEditor, useValue } from '@tldraw/editor';
import { useMemo } from 'react';
import Tippy from '@tippyjs/react';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { TLUiTranslationKey, useTools } from '@tldraw/tldraw';
import {
  CUSTOM_SQUARE_ARROW_SHAPE_ID,
  CUSTOM_LINE_SHAPE_ID,
  CUSTOM_STRAIGHT_ARROW_SHAPE_ID,
  CUSTOM_SOFT_ARROW_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import { DocablyArrowColor } from '@app/constants/whiteboard/whiteboard-styles';

const ArrowTool = () => {
  const {
    ref,
    isVisible: isOpen,
    setIsVisible: setOpen,
  } = useClickOutside(false);
  const editor = useEditor();
  const tools = useTools();
  const activeTool = useValue('activeTool', () => editor.getCurrentToolId(), [
    editor,
  ]);

  const isArrowToolSelect = useMemo(() => {
    return (
      [
        CUSTOM_SQUARE_ARROW_SHAPE_ID,
        CUSTOM_STRAIGHT_ARROW_SHAPE_ID,
        CUSTOM_LINE_SHAPE_ID,
        CUSTOM_SOFT_ARROW_SHAPE_ID,
      ] as string[]
    ).includes(activeTool);
  }, [activeTool]);

  const handleClick = () => {
    setOpen(!isOpen);
  };

  const createShape = (id: string) => {
    tools[id] = {
      id: id,
      icon: 'color',
      label: `tools.${id}` as TLUiTranslationKey,
      kbd: 'r,s',
      readonlyOk: false,
      onSelect: (source) => {
        editor.selectNone();
        editor.setStyleForNextShapes(
          DocablyArrowColor,
          DocablyArrowColor.defaultValue
        );
        editor.setCurrentTool(id);
      },
    };
    tools[id].onSelect('toolbar');
    setOpen(false);
  };

  return (
    <Tippy
      duration={0}
      content={isOpen ? '' : 'Arrows'}
      className={
        isOpen
          ? ''
          : '!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
      }
    >
      <div ref={ref} className='pointer-events-auto relative flex items-center'>
        <Arrow
          className={cn(
            'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
            {
              'bg-[var(--background-gray-hover)]': isOpen || isArrowToolSelect,
            }
          )}
          onClick={handleClick}
        />
        {isOpen && (
          <div className='absolute flex left-[44px] p-[4px] z-[var(--zIndexWhiteboard)] bg-[var(--white)] rounded-[var(--border-radius)] shadow-sh2 items-center justify-center flex-col'>
            <Tippy
              duration={0}
              content='Line'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
            >
              <Line
                className={cn(
                  'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
                  {
                    'bg-[var(--background-gray-hover)]':
                      activeTool === CUSTOM_LINE_SHAPE_ID,
                  }
                )}
                onClick={() => createShape(CUSTOM_LINE_SHAPE_ID)}
              />
            </Tippy>
            <Tippy
              duration={0}
              content='Arrow'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
            >
              <Arrow
                className={cn(
                  'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
                  {
                    'bg-[var(--background-gray-hover)]':
                      activeTool === CUSTOM_STRAIGHT_ARROW_SHAPE_ID,
                  }
                )}
                onClick={() => createShape(CUSTOM_STRAIGHT_ARROW_SHAPE_ID)}
              />
            </Tippy>
            <Tippy
              duration={0}
              content='Square arrow'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
            >
              <ArrowStrictSquare
                className={cn(
                  'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
                  {
                    'bg-[var(--background-gray-hover)]':
                      activeTool === CUSTOM_SQUARE_ARROW_SHAPE_ID,
                  }
                )}
                onClick={() => createShape(CUSTOM_SQUARE_ARROW_SHAPE_ID)}
              />
            </Tippy>
            <Tippy
              duration={0}
              content='Soft arrow'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
            >
              <ArrowSquare
                className={cn(
                  'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
                  {
                    'bg-[var(--background-gray-hover)]':
                      activeTool === CUSTOM_SOFT_ARROW_SHAPE_ID,
                  }
                )}
                onClick={() => createShape(CUSTOM_SOFT_ARROW_SHAPE_ID)}
              />
            </Tippy>
          </div>
        )}
      </div>
    </Tippy>
  );
};

export default ArrowTool;
