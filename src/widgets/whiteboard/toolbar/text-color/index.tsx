import { useClickOutside } from '@app/hooks/useClickOutside';
import { useEditor, useValue } from '@tldraw/editor';
import cn from 'classnames';
import Tippy from '@tippyjs/react';
import Quill, { RangeStatic } from 'quill';
import { useEffect, useMemo, useState } from 'react';
import { DokablyTextColor } from '@app/constants/whiteboard/whiteboard-styles';
import { getQuill, getQuillForShape } from '@app/utils/whiteboard/quill/utils';
import { useSelectedShapes } from '@app/utils/whiteboard/useSelectedShapes';

export const TextColor = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);
  const editor = useEditor();

  const selectedShapes = useSelectedShapes();

  const currentShapeQuill = useMemo(() => getQuillForShape(selectedShapes[0].id), [selectedShapes]);

  const initialColor = useMemo(() => {
    if (!currentShapeQuill) {
      return DokablyTextColor.defaultValue;
    }
    const formattedParts = currentShapeQuill.getContents().ops || [];
    const partsWithoutLastNewLine = formattedParts.slice(0, -1);

    if (!partsWithoutLastNewLine.length) {
      return DokablyTextColor.defaultValue;
    }

    let commonColor = null;

    for (let i = 0; i < partsWithoutLastNewLine.length; i++) {
      const currentItem = partsWithoutLastNewLine[i];
      const currentItemColor = currentItem.attributes?.color;

      if (!currentItemColor) {
        commonColor = null;
        break;
      }

      if (currentItemColor && !commonColor) {
        commonColor = currentItemColor;
      } else if (currentItemColor && commonColor && currentItemColor !== commonColor) {
        commonColor = null;
        break;
      }
    }

    return commonColor || DokablyTextColor.defaultValue;
  }, [currentShapeQuill])

  const [currentColor, setCurrentColor] = useState<string | null>(null);


  const getCurrentSelectionColor = (range: RangeStatic) => {
    if (!range) return;
    const rangeFormat = currentShapeQuill.getFormat(range);

    if (!rangeFormat.color || Array.isArray(rangeFormat.color)) {
      return setCurrentColor(DokablyTextColor.defaultValue);
    }

    setCurrentColor(rangeFormat.color);
  };

  useEffect(() => {
    if (!currentShapeQuill) return;

    currentShapeQuill.on('selection-change', (range) => {
      getCurrentSelectionColor(range)
    });
  }, [currentShapeQuill])

  const activeShape = selectedShapes[0];
  if (!activeShape) return null;

  const isEditing = useValue(
    'isEditing',
    () => editor.getEditingShape()?.id === activeShape.id,
    [editor, activeShape.id]
  );

  const changeColorIfRangeSelected = (color: string, range: RangeStatic, quill: Quill) => {
    if (!quill) return;
    if (isEditing || (!isEditing && range.length != 0 && quill)) {
      if (range.length === 0) {
        quill.format('color', color);
      } else {
        quill.formatText(range, 'color', color);
      }
    } else {
      const length = quill.getText().length;
      quill.formatText({ index: 0, length }, 'color', color);
    }
  }

  const changeColorIfRangeNotSelected = (color: string, text: string, quill: Quill) => {
    if (!quill) return;

    const length = quill.getText().length;

    quill.formatText({ index: 0, length: length }, 'color', color);
  }

  const onColorChange = (color: string, quill: Quill) => {
    if (!quill) return;

    const range = quill.getSelection();
    const text = quill.getText();

    if (range) {
      changeColorIfRangeSelected(color, range, quill);
    } else if (text) {
      changeColorIfRangeNotSelected(color, text, quill);
    }
  };

  const changeFontStyleForSeveralShapes = (color: string) => {
    const quillInstances = selectedShapes.map((shape) => getQuillForShape(shape.id));
    quillInstances.forEach((quillInstance) => onColorChange(color, quillInstance));
  };

  const showTextColorBtn = useMemo(
    () =>
      !!(selectedShapes || []).length &&
      selectedShapes.every((shape) =>
        Object(shape.props).hasOwnProperty('text')
      ),
    [selectedShapes]
  );

  if (!showTextColorBtn) return null;

  return (
    (
      <>
        <div
          ref={ref}
          className={cn('toolbar-item', {
            ['toolbar-item__active']: isVisible,
          })}
          onClick={() => setIsVisible(!isVisible)}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Tippy
            duration={0}
            content='Text color'
            className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
          >
            <svg
              width='21'
              height='20'
              viewBox='0 0 21 20'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M2.699 16.2505C2.44233 16.2505 2.24525 16.1405 2.10775 15.9205C1.97025 15.7005 1.9565 15.4667 2.0665 15.2192L5.93025 5.99297C6.06775 5.67214 6.29233 5.51172 6.604 5.51172C6.934 5.51172 7.15858 5.67214 7.27775 5.99297L11.1552 15.2467C11.2561 15.5034 11.2377 15.7371 11.1002 15.948C10.9719 16.1496 10.7748 16.2505 10.509 16.2505C10.3715 16.2505 10.2386 16.2138 10.1102 16.1405C9.99108 16.058 9.904 15.948 9.849 15.8105L6.439 7.34047H6.824L3.359 15.8105C3.29483 15.9571 3.19858 16.0671 3.07025 16.1405C2.95108 16.2138 2.82733 16.2505 2.699 16.2505ZM3.42775 13.8855L3.97775 12.703H9.36775L9.91775 13.8855H3.42775Z'
                fill='#69696B'
                stroke='#69696B'
                strokeWidth='0.2'
              />
              <ellipse
                cx='15.5'
                cy='6.25'
                rx='3.75'
                ry='3.75'
                fill={currentColor || initialColor as string}
              />
            </svg>
          </Tippy>
          {isVisible && (
            <div className='toolbar-list'>
              <div className='row' style={{ gap: '10px', padding: '9px' }}>
                {DokablyTextColor.values.map((color: string) => (
                  <div
                    key={color}
                    className={cn('color-button__wrapper')}
                    style={
                      {
                        '--color-button': color,
                      } as React.CSSProperties
                    }
                    onClick={() => {
                      setCurrentColor(color);
                      changeFontStyleForSeveralShapes(color);
                    }}
                  >
                    <div
                      className='color-button'
                      style={
                        {
                          '--color-button': color,
                        } as React.CSSProperties
                      }
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    )
  );
};

export default TextColor;
