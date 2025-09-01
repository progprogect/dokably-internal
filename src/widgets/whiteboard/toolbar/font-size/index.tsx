import { useMemo } from 'react';
import { useEditor, useValue } from '@tldraw/editor';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { ReactComponent as ArrowUpSmall } from '@icons/arrow-up-small.svg';
import { ReactComponent as ArrowDownSmall } from '@icons/arrow-down-small.svg';
import cn from 'classnames';
import './../style.css';
import './style.css';
import Tippy from '@tippyjs/react';
import {
  DEFAULT_FONT_SIZE,
  FONT_SIZES,
} from '@app/constants/whiteboard/constants';
import { useSelectedShapes } from '@app/utils/whiteboard/useSelectedShapes';

export const FontSize = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);
  const editor = useEditor();

  const selectedShapes = useSelectedShapes();

  const selectionBounds = useValue(
    'selectionBounds',
    () => editor.getSelectionRotatedPageBounds(),
    [editor]
  );

  const showFontSizeBtn = useMemo(() => {
    return (
      !!(selectedShapes || []).length &&
      selectedShapes.every(
        (item) =>
          Object(item?.props).hasOwnProperty('text') &&
          Object(item?.props).hasOwnProperty('fontSize')
      )
    );
  }, [selectedShapes]);

  const currentFontSize = useMemo(
    () => Math.round((selectedShapes[0]?.props as any)?.fontSize) ?? DEFAULT_FONT_SIZE,
    [selectedShapes]
  );

  const changeFontSize = (value: number) => {
    if (!editor) return;

    const selectedShapesToUpdate = selectedShapes.map((shape) => ({
      id: shape.id,
      type: shape.type,
      props: { fontSize: value },
    }));

    editor.updateShapes(selectedShapesToUpdate);
  };

  const findBiggerSize = (currentSize: number) => {
    const indexOfCurrentSizeInTheList = FONT_SIZES.indexOf(currentSize);

    const isCurrentSizeInTheList = indexOfCurrentSizeInTheList >= 0;
    const isCurrentSizeLast =
      indexOfCurrentSizeInTheList === FONT_SIZES.length - 1;

    if (isCurrentSizeInTheList && !isCurrentSizeLast) {
      return FONT_SIZES[indexOfCurrentSizeInTheList + 1];
    }

    if (isCurrentSizeInTheList && isCurrentSizeLast) {
      return FONT_SIZES[indexOfCurrentSizeInTheList];
    }

    if (!isCurrentSizeInTheList) {
      for (let index = 0; index <= FONT_SIZES.length - 1; index++) {
        const fontSizeItem = FONT_SIZES[index];

        if (currentSize < fontSizeItem && index !== FONT_SIZES.length - 1) {
          return FONT_SIZES[index];
        }
        if (currentSize < fontSizeItem && index === FONT_SIZES.length - 1) {
          return currentSize;
        }
      }
    }

    return currentSize;
  };

  const findSmallerSize = (currentSize: number) => {
    const indexOfCurrentSizeInTheList = FONT_SIZES.indexOf(currentSize);

    const isCurrentSizeInTheList = indexOfCurrentSizeInTheList >= 0;
    const isCurrentSizeFirst = indexOfCurrentSizeInTheList === 0;

    if (isCurrentSizeInTheList && !isCurrentSizeFirst) {
      return FONT_SIZES[indexOfCurrentSizeInTheList - 1];
    }

    if (isCurrentSizeInTheList && isCurrentSizeFirst) {
      return FONT_SIZES[indexOfCurrentSizeInTheList];
    }

    if (!isCurrentSizeInTheList) {
      for (let index = FONT_SIZES.length - 1; index > 0; index -= 1) {
        const fontSizeItem = FONT_SIZES[index];

        if (currentSize > fontSizeItem && index !== 0) {
          return FONT_SIZES[index];
        }
        if (currentSize > fontSizeItem && index === 0) {
          return currentSize;
        }
      }
    }

    return currentSize;
  };

  const upFontSize = (e: React.MouseEvent) => {
    if (!currentFontSize) return null;

    e.stopPropagation();
    const nextSize = findBiggerSize(currentFontSize);

    if (nextSize !== currentFontSize) {
      changeFontSize(nextSize);
    }
  };

  const downFontSize = (e: React.MouseEvent) => {
    if (!currentFontSize) return null;

    e.stopPropagation();
    const nextSize = findSmallerSize(currentFontSize);

    if (nextSize !== currentFontSize) {
      changeFontSize(nextSize);
    }
  };

  const sizes = useMemo(() => {
    let s = FONT_SIZES;
    if (!s.includes(currentFontSize)) {
      s = [...FONT_SIZES, currentFontSize]
    }
    s.sort((a, b) => a - b);
    return s;
  }, [currentFontSize]);

  if (!showFontSizeBtn) return null;

  return (
    <>
      <div className='row w-[44px] min-w-[44px]'>
        <div
          ref={ref}
          className={cn('toolbar-item w-full', {
            ['toolbar-item__active']: isVisible,
          })}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsVisible(!isVisible);
          }}
        >
          <Tippy
            duration={0}
            content='Font size'
            className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
          >
            <div>{currentFontSize}</div>
          </Tippy>
          {isVisible && (
            <div
              className='toolbar-list'
              style={{
                minWidth: '42px',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              {sizes.map((font) => (
                <button
                  key={font}
                  className={cn('toolbar-item', {
                    ['toolbar-item__active']: currentFontSize === font,
                  })}
                  style={{
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    minHeight: '28px',
                  }}
                  onClick={() => changeFontSize(font)}
                >
                  {Math.round(font)}
                </button>
              ))}
            </div>
          )}
          <div className='font-size-arrow-controls'>
            <Tippy
              duration={0}
              content='increase font size'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
            >
              <div
                className='font-size-arrow-control'
                style={{ marginBottom: '2px' }}
                onClick={upFontSize}
              >
                <ArrowUpSmall />
              </div>
            </Tippy>
            <Tippy
              duration={0}
              content='decrease font size'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
            >
              <div className='font-size-arrow-control' onClick={downFontSize}>
                <ArrowDownSmall />
              </div>
            </Tippy>
          </div>
        </div>
      </div>

      <div className='divider' />
    </>
  );
};

export default FontSize;
