import cn from 'classnames';
import { ReactComponent as Shapes } from '@icons/shapes.svg';
import { ReactComponent as Rectangle } from '@icons/shapes/rectangle.svg';
import { ReactComponent as RectangleSoft } from '@icons/shapes/rectangle-soft.svg';
import { ReactComponent as Ellipse } from '@icons/shapes/ellipse.svg';
import { ReactComponent as Polygon } from '@icons/shapes/polygon.svg';
import { ReactComponent as Rhombus } from '@icons/shapes/rhombus.svg';
import { ReactComponent as BubbleSquare } from '@icons/shapes/bubble-square.svg';
import { ReactComponent as Parallelogram } from '@icons/shapes/parallelogram.svg';
import { ReactComponent as Star } from '@icons/shapes/star.svg';
import { ReactComponent as ArrowRight } from '@icons/shapes/arrow-right.svg';
import { GeoShapeGeoStyle, useEditor, useValue } from '@tldraw/editor';
import { DocablyBgColor } from '@app/constants/whiteboard/whiteboard-styles';
import { useClickOutside } from '@app/hooks/useClickOutside';
import Tippy from '@tippyjs/react';
import { memo } from 'react';
import { TLUiTranslationKey, useTools } from '@tldraw/tldraw';
import {
  CUSTOM_ARROW_RIGHT_SHAPE_ID,
  CUSTOM_BUBBLE_SHAPE_ID,
  CUSTOM_ELLIPSE_SHAPE_ID,
  CUSTOM_PARALLELOGRAM_SHAPE_ID,
  CUSTOM_POLYGON_SHAPE_ID,
  CUSTOM_RECTANGLE_SHAPE_ID,
  CUSTOM_RECTANGLE_SOFT_SHAPE_ID,
  CUSTOM_RHOMBUS_SHAPE_ID,
  CUSTOM_SEXAGON_SHAPE_ID,
  CUSTOM_STAR_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';

export const customShapeIds = [
  CUSTOM_RECTANGLE_SHAPE_ID,
  CUSTOM_RECTANGLE_SOFT_SHAPE_ID,
  CUSTOM_ELLIPSE_SHAPE_ID,
  CUSTOM_POLYGON_SHAPE_ID,
  CUSTOM_RHOMBUS_SHAPE_ID,
  CUSTOM_BUBBLE_SHAPE_ID,
  CUSTOM_PARALLELOGRAM_SHAPE_ID,
  CUSTOM_STAR_SHAPE_ID,
  CUSTOM_ARROW_RIGHT_SHAPE_ID,
  CUSTOM_SEXAGON_SHAPE_ID,
] as string[];

const ShapeTool = () => {
  const editor = useEditor();
  const tools = useTools();

  const activeTool = useValue('activeTool', () => editor.getCurrentToolId(), [
    editor,
  ]);

  const geoState = useValue(
    'geo',
    () => editor.getSharedStyles().getAsKnownValue(GeoShapeGeoStyle),
    [editor]
  );

  const {
    ref,
    isVisible: isOpen,
    setIsVisible: setOpen,
  } = useClickOutside(false);

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
          DocablyBgColor,
          DocablyBgColor.defaultValue
        );
        editor.setCurrentTool(id);
      },
    };
    tools[id].onSelect('toolbar');
    setOpen(false);
  };

  return (
    <>
      <Tippy
        duration={0}
        content={isOpen ? '' : 'Shapes'}
        className={
          isOpen
            ? ''
            : '!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs left-[27px] absolute top-[13px]'
        }
      >
        <div
          ref={ref}
          className='pointer-events-auto relative flex items-center'
        >
          <Shapes
            className={cn(
              'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]',
              {
                'bg-[var(--background-gray-hover)]':
                  isOpen || (geoState != undefined && activeTool != 'select'),
              }
            )}
            onClick={handleClick}
          />
          {isOpen && (
            <div className='absolute flex flex-wrap left-[44px] w-[132px] p-[12px] h-[132px] z-[var(--zIndexWhiteboard)] bg-[var(--white)] rounded-[var(--border-radius)] shadow-sh2 items-center justify-center'>
              <div className='pointer-events-auto relative flex items-center'>
                <Rectangle
                  className={cn(
                    'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]'
                  )}
                  onClick={() => createShape(CUSTOM_RECTANGLE_SHAPE_ID)}
                />
              </div>
              <div className='pointer-events-auto relative flex items-center'>
                <RectangleSoft
                  className={cn(
                    'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]'
                  )}
                  onClick={() => createShape(CUSTOM_RECTANGLE_SOFT_SHAPE_ID)}
                />
              </div>
              <div className='pointer-events-auto relative flex items-center'>
                <Ellipse
                  className={cn(
                    'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]'
                  )}
                  onClick={() => createShape(CUSTOM_ELLIPSE_SHAPE_ID)}
                />
              </div>
              <div className='pointer-events-auto relative flex items-center'>
                <Polygon
                  className={cn(
                    'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]'
                  )}
                  onClick={() => createShape(CUSTOM_POLYGON_SHAPE_ID)}
                />
              </div>
              <div className='pointer-events-auto relative flex items-center'>
                <Rhombus
                  className={cn(
                    'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]'
                  )}
                  onClick={() => createShape(CUSTOM_RHOMBUS_SHAPE_ID)}
                />
              </div>
              <div className='pointer-events-auto relative flex items-center'>
                <BubbleSquare
                  className={cn(
                    'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]'
                  )}
                  onClick={() => createShape(CUSTOM_BUBBLE_SHAPE_ID)}
                />
              </div>
              <div className='pointer-events-auto relative flex items-center'>
                <Parallelogram
                  className={cn(
                    'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]'
                  )}
                  onClick={() => createShape(CUSTOM_PARALLELOGRAM_SHAPE_ID)}
                />
              </div>
              <div className='pointer-events-auto relative flex items-center'>
                <Star
                  className={cn(
                    'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]'
                  )}
                  onClick={() => createShape(CUSTOM_STAR_SHAPE_ID)}
                />
              </div>
              <div className='pointer-events-auto relative flex items-center'>
                <ArrowRight
                  className={cn(
                    'icon w-[36px] h-[36px] p-[7px] cursor-pointer rounded-[var(--border-radius)] hover:bg-[var(--background-gray-hover)]'
                  )}
                  onClick={() => createShape(CUSTOM_ARROW_RIGHT_SHAPE_ID)}
                />
              </div>
            </div>
          )}
        </div>
      </Tippy>
    </>
  );
};

export default memo(ShapeTool);
