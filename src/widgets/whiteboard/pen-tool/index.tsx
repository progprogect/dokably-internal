import cn from 'classnames';
import { ReactComponent as Pen } from '@icons/pen.svg';
import { ReactComponent as Pencil } from '@icons/pencil.svg';
import { ReactComponent as Highlighter } from '@icons/highlighter.svg';
import { ReactComponent as Eraser } from '@icons/eraser.svg';
import {
  useEditor,
  useValue,
} from '@tldraw/editor';
import {
  DokablyColor,
  DokablyHighlightSize,
  DokablyPenSize,
} from '@app/constants/whiteboard/whiteboard-styles';
import { FC, useMemo, useState } from 'react';
import Tippy from '@tippyjs/react';
import {
  DRAW_MAX_SIZE,
  DRAW_MIN_SIZE,
  HIGHLIGHT_DEFAULT_SIZE,
  PEN_DEFAULT_SIZE,
  PEN_HIGHLIGHT_DEFAULT_COLOR,
} from '@app/constants/whiteboard/constants';
import Slider from '@shared/uikit/slider';
import { useTools } from '@tldraw/tldraw';
import { CUSTOM_DRAW_SHAPE_ID, CUSTOM_HIGHLIGHT_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

type Props = {};

const PenTool: FC<Props> = () => {
  const editor = useEditor();
  const tools = useTools();
  const activeTool = useValue('activeTool', () => editor.getCurrentToolId(), [
    editor,
  ]);

  const isDrawingToolSelect = useMemo(() => {
    return (
      activeTool === CUSTOM_DRAW_SHAPE_ID ||
      activeTool === CUSTOM_HIGHLIGHT_SHAPE_ID ||
      activeTool === 'eraser'
    );
  }, [activeTool]);

  const [isOpen, setOpen] = useState<boolean>(false);

  const handleClick = () => {
    if (isOpen && isDrawingToolSelect) {
      tools['select'].onSelect('toolbar');
    }
    setOpen(!isOpen);
  };

  return (
    <Tippy
      duration={0}
      content={isDrawingToolSelect || isOpen ? '' : 'Pen tool'}
      className={
        isDrawingToolSelect || isOpen
          ? ''
          : '!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
      }
    >
      <div className='pointer-events-auto relative flex items-center'>
        <Pen
          className={cn(
            'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
            {
              'bg-[var(--background-gray-hover)]':
                isDrawingToolSelect || isOpen,
            }
          )}
          onClick={handleClick}
        />
        {(isDrawingToolSelect || isOpen) && (
          <div className='absolute flex left-[44px] top-[-40px] p-[4px] z-[var(--zIndexWhiteboard)] bg-[var(--white)] rounded-[var(--border-radius)] shadow-sh2 items-center justify-center flex-col'>
            <Tippy
              duration={0}
              content='Pen'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
            >
              <Pencil
                className={cn(
                  'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
                  {
                    'bg-[var(--background-gray-hover)]':
                      activeTool === CUSTOM_DRAW_SHAPE_ID,
                  }
                )}
                onClick={() => {
                  editor.setStyleForNextShapes(
                    DokablyColor,
                    PEN_HIGHLIGHT_DEFAULT_COLOR
                  );
                  editor.setStyleForNextShapes(
                    DokablyPenSize,
                    PEN_DEFAULT_SIZE
                  );
                  tools['draw'].onSelect('toolbar');
                }}
              />
            </Tippy>
            <Tippy
              duration={0}
              content='Highlighter'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
            >
              <Highlighter
                className={cn(
                  'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
                  {
                    'bg-[var(--background-gray-hover)]':
                      activeTool === CUSTOM_HIGHLIGHT_SHAPE_ID,
                  }
                )}
                onClick={() => {
                  editor.setStyleForNextShapes(
                    DokablyColor,
                    PEN_HIGHLIGHT_DEFAULT_COLOR
                  );
                  editor.setStyleForNextShapes(
                    DokablyHighlightSize,
                    HIGHLIGHT_DEFAULT_SIZE
                  );
                  tools['highlight'].onSelect('toolbar');
                }}
              />
            </Tippy>
            <Tippy
              duration={0}
              content='Eraser'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
            >
              <Eraser
                className={cn(
                  'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
                  {
                    'bg-[var(--background-gray-hover)]':
                      activeTool === 'eraser',
                  }
                )}
                onClick={() => {
                  tools['eraser'].onSelect('toolbar');
                }}
              />
            </Tippy>
            <div className='divider !w-[36px] my-[2px]' />
            <PenSettings />
          </div>
        )}
      </div>
    </Tippy>
  );
};

const PenSettings = () => {
  const colors = [
    '#000000',
    '#7B44F0',
    '#FB91AB',
    '#4A86FF',
    '#1FCC78',
    '#FFD600',
    '#FF5065',
    '#A9A9AB',
    '#FFFFFF',
  ];

  const editor = useEditor();
  const activeTool = useValue('activeTool', () => editor.getCurrentToolId(), [
    editor,
  ]);

  const activeColor = useValue(
    'activeColor',
    () => {
      let color = editor.getInstanceState().stylesForNextShape['dokably:colors'];
      if (!color) {
        return PEN_HIGHLIGHT_DEFAULT_COLOR;
      }
      if (color && !colors.includes(color as string))
        return PEN_HIGHLIGHT_DEFAULT_COLOR;
      return color as string;
    },
    [editor]
  );

  const activeSize = useValue(
    'activeSize',
    () => {
      if (activeTool === CUSTOM_HIGHLIGHT_SHAPE_ID || activeTool === CUSTOM_DRAW_SHAPE_ID) {
        if (activeTool === CUSTOM_DRAW_SHAPE_ID) {
          return (
            (editor.getInstanceState().stylesForNextShape[
              'dokably:pen-size'
            ] as number) ?? PEN_DEFAULT_SIZE
          );
        }
        if (activeTool === CUSTOM_HIGHLIGHT_SHAPE_ID) {
          return (
            (editor.getInstanceState().stylesForNextShape[
              'dokably:highlight-size'
            ] as number) ?? HIGHLIGHT_DEFAULT_SIZE
          );
        }
      }
      return PEN_DEFAULT_SIZE;
    },
    [editor, activeTool]
  );

  const thicknessViewSize = useMemo(() => {
    // circle width - 4px margin - 100% and MAX size
    const percent = (activeSize * (100 / DRAW_MAX_SIZE)) / 100;
    return 16 * percent;
  }, [activeSize, activeTool]);

  const [isOpen, setOpen] = useState<boolean>(false);

  const handleClick = () => {
    if (activeTool === CUSTOM_DRAW_SHAPE_ID || activeTool === CUSTOM_HIGHLIGHT_SHAPE_ID) {
      setOpen(!isOpen);
    } else {
      setOpen(false);
    }
  };

  const handleChangeColor = (color: string) => {
    editor.setStyleForNextShapes(DokablyColor, color);
  };

  const handleChangeSize = (size: number) => {
    editor.setStyleForNextShapes(DokablyPenSize as any, size);
    editor.setStyleForNextShapes(DokablyHighlightSize as any, size);
  };

  return (
    <div
      className={cn(
        'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)] relative',
        {
          'bg-[var(--background-gray-hover)]': isOpen,
          'pointer-events-none opacity-[0.4]': !(
            activeTool === CUSTOM_DRAW_SHAPE_ID || activeTool === CUSTOM_HIGHLIGHT_SHAPE_ID
          ),
        }
      )}
    >
      <Tippy
        duration={0}
        content={isOpen ? '' : 'Thickness and color'}
        className={
          isOpen
            ? ''
            : '!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[7px] w-[120px]'
        }
      >
        <div
          className='rounded-[50%] w-[22px] h-[22px] border-[1px] border-[var(--text40)] flex items-center justify-center'
          onClick={handleClick}
        >
          <div
            style={{
              backgroundColor: activeColor,
              width: `${thicknessViewSize}px`,
              height: `${thicknessViewSize}px`,
            }}
            className='rounded-[50%]'
          ></div>
        </div>
      </Tippy>
      {isOpen && (
        <div className='absolute cursor-default flex left-[44px] bottom-[-4px] px-[12px] py-[8px] z-[var(--zIndexWhiteboard)] bg-[var(--white)] rounded-[var(--border-radius)] shadow-sh2 w-[96px] h-[108px] items-center justify-center flex-col'>
          <Slider
            className='w-[72px] h-[12px] mb-[8px]'
            min={DRAW_MIN_SIZE}
            max={DRAW_MAX_SIZE}
            step={1}
            value={activeSize}
            defaultValue={activeSize}
            onValueChange={(value) => handleChangeSize(value)}
          />

          <div className='w-[72px] h-[72px] flex flex-wrap gap-[8px] justify-center items-center'>
            {colors.map((color: string) => (
              <div
                key={`color-picker-color-${color}`}
                className={cn(
                  'w-[18px] h-[18px] flex items-center justify-center rounded-[50%] cursor-pointer hover:shadow-colorWrapper',
                  {
                    'shadow-colorWrapper':
                      color.toUpperCase() === activeColor.toUpperCase(),
                  }
                )}
                onClick={() => handleChangeColor(color)}
              >
                <div
                  style={{
                    backgroundColor: color,
                  }}
                  className={cn('rounded-[50%] w-[16px] h-[16px] ', {
                    'border-[0.5px] border-[var(--text40)]':
                      color.toUpperCase() === '#FFFFFF',
                  })}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PenTool;
