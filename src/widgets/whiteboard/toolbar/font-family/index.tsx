import { useClickOutside } from '@app/hooks/useClickOutside';
import './../style.css';
import { WhiteboardFonts } from '@app/constants/whiteboard/whiteboard-fonts';
import { TLShape, useEditor, useValue } from '@tldraw/editor';
import { useMemo } from 'react';
import cn from 'classnames';
import './style.css';
import Tippy from '@tippyjs/react';
import { useSelectedShapes } from '@app/utils/whiteboard/useSelectedShapes';
import { isThereAnyMindMapInput } from '@widgets/whiteboard/mindmap/helpers';

export const FontFamily = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);
  const editor = useEditor();

  const selectedShapes = useSelectedShapes();

  const selectionBounds = useValue(
    'selectionBounds',
    () => editor.getSelectionRotatedPageBounds(),
    [editor]
  );

  const showFontFamilyBtn = useMemo(() => {
    if (isThereAnyMindMapInput(selectedShapes)) return false;

    return (
      !!(selectedShapes || []).length &&
      selectedShapes.every(
        (item) =>
          Object(item?.props).hasOwnProperty('text') &&
          Object(item?.props).hasOwnProperty('fontFamily')
      )
    );
  }, [selectedShapes]);

  const currentFontFamily = useMemo(
    () => (selectedShapes[0].props as any).fontFamily ?? 'Euclid Circular A',
    [selectedShapes, selectionBounds]
  );

  const changeFontFamily = (value: string) => {
    if (!editor) return;

    const selectedShapesToUpdate = selectedShapes.map((shape) => ({
      id: shape.id,
      type: shape.type,
      props: { fontFamily: value },
    }));

    editor.updateShapes(selectedShapesToUpdate);
  };

  if (!showFontFamilyBtn) return null;

  return (
    <>
      <div
        ref={ref}
        className={cn('toolbar-item', {
          ['toolbar-item__active']: isVisible,
        })}
        onClick={() => setIsVisible(!isVisible)}
      >
        <Tippy
          duration={0}
          content='Font family'
          className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
        >
          <div
            className='font-family-menu__title'
            style={{ fontFamily: currentFontFamily }}
          >
            {currentFontFamily}
          </div>
        </Tippy>
        {isVisible && (
          <div
            className='toolbar-list font-family-menu'
            style={{ left: '-6px' }}
          >
            <div className='flex-col flex'>
              {WhiteboardFonts.map((font) => (
                <button
                  key={font.key}
                  className={cn('toolbar-item', {
                    ['toolbar-item__active']: currentFontFamily === font.value,
                  })}
                  style={
                    {
                      '--ql-toolbar-font-family': font.value,
                    } as React.CSSProperties
                  }
                  onClick={() => changeFontFamily(font.value)}
                >
                  {font.value}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className='divider' />
    </>
  );
};

export default FontFamily;
