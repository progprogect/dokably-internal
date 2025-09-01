import { useClickOutside } from '@app/hooks/useClickOutside';
import { useEditor, useValue } from '@tldraw/editor';
import cn from 'classnames';
import Tippy from '@tippyjs/react';
import { getQuillForShape } from '@app/utils/whiteboard/quill/utils';
import { TEXT_HIGHLIGHT_COLORS } from '@app/constants/whiteboard/whiteboard-colors';
import Quill, { RangeStatic } from 'quill';
import { useEffect, useMemo, useState } from 'react';
import { useSelectedShapes } from '@app/utils/whiteboard/useSelectedShapes';

export const TextHighlight = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);
  const editor = useEditor();

  const selectedShapes = useSelectedShapes();

  const currentShapeQuill = useMemo(
    () => getQuillForShape(selectedShapes[0].id),
    [selectedShapes]
  );

  const [currentColor, setCurrentColor] = useState<string | null>(null);

  const getCurrentSelectionColor = (range: RangeStatic) => {
    if (!range) return;
    const rangeFormat = currentShapeQuill.getFormat(range);

    if (!rangeFormat.background || Array.isArray(rangeFormat.background)) {
      return setCurrentColor(null);
    }

    setCurrentColor(rangeFormat.background);
  };

  useEffect(() => {
    if (!currentShapeQuill) return;

    currentShapeQuill.on('selection-change', (range) => {
      getCurrentSelectionColor(range);
    });
  }, [currentShapeQuill]);

  const activeShape = selectedShapes[0];

  const isEditing = useValue(
    'isEditing',
    () => editor.getEditingShape()?.id === activeShape.id,
    [editor, activeShape.id]
  );

  const handleHighlightRimColorChange = (color: string | boolean) => {
    setCurrentColor(typeof color === 'string' ? color : null);
  };

  const changeHighlightIfRangeSelected = (
    color: string | boolean,
    range: RangeStatic,
    quill: Quill
  ) => {
    if (!quill) return;

    if (isEditing) {
      if (range.length === 0) {
        quill.format('background', color);
      } else {
        quill.formatText(range, 'background', color);
      }
    } else {
      const length = quill.getText().length;
      quill.formatText({ index: 0, length }, 'background', color);
    }
  };
  const changeHighlightIfTextInShape = (
    color: string | boolean,
    quill: Quill
  ) => {
    if (!quill) return;

    const length = quill.getText().length;

    quill.formatText({ index: 0, length: length }, 'background', color);
  };

  const onHighlightChange = (color: string | boolean, quill: Quill) => {
    if (!quill) return;

    const range = quill.getSelection();
    const text = quill.getText();

    if (range) {
      return changeHighlightIfRangeSelected(color, range, quill);
    }

    if (text) {
      return changeHighlightIfTextInShape(color, quill);
    }
  };

  const changeHighlightForSeveralShapes = (color: string | boolean) => {
    const quillInstances = selectedShapes.map((shape) =>
      getQuillForShape(shape.id)
    );
    quillInstances.forEach((quillInstance) =>
      onHighlightChange(color, quillInstance)
    );
    handleHighlightRimColorChange(color);
  };

  const showTextHighlightBtn = useMemo(
    () =>
      !!(selectedShapes || []).length &&
      selectedShapes.every((shape) =>
        Object(shape.props).hasOwnProperty('text')
      ),
    [selectedShapes]
  );

  if (!showTextHighlightBtn) return null;

  return (
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
          content='Highlight'
          className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
        >
          <svg
            width='21'
            height='20'
            viewBox='0 0 21 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <rect
              x='2'
              y='1.2'
              width='17'
              height='17'
              rx='3.75'
              stroke={currentColor || '#D4D4D5'}
              strokeWidth='1.2'
            />
            <path
              d='M6.56814 15.4888C6.31147 15.4888 6.11439 15.3788 5.97689 15.1588C5.83939 14.9388 5.82564 14.705 5.93564 14.4575L9.79939 5.23125C9.93689 4.91042 10.1615 4.75 10.4731 4.75C10.8031 4.75 11.0277 4.91042 11.1469 5.23125L15.0244 14.485C15.1252 14.7417 15.1069 14.9754 14.9694 15.1863C14.8411 15.3879 14.644 15.4888 14.3781 15.4888C14.2406 15.4888 14.1077 15.4521 13.9794 15.3787C13.8602 15.2963 13.7731 15.1863 13.7181 15.0487L10.3081 6.57875H10.6931L7.22814 15.0487C7.16397 15.1954 7.06772 15.3054 6.93939 15.3787C6.82022 15.4521 6.69647 15.4888 6.56814 15.4888ZM7.29689 13.1237L7.84689 11.9412H13.2369L13.7869 13.1237H7.29689Z'
              fill='#69696B'
              stroke='#69696B'
              strokeWidth='0.2'
            />
          </svg>
        </Tippy>
        {isVisible && (
          <div className='toolbar-list'>
            <div className='row' style={{ gap: '10px', padding: '9px' }}>
              {TEXT_HIGHLIGHT_COLORS.map((color) => (
                <div
                  key={color}
                  className={cn('color-button__wrapper')}
                  style={
                    {
                      '--color-button': color,
                    } as React.CSSProperties
                  }
                  onClick={() => changeHighlightForSeveralShapes(color)}
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
              <div
                className={cn('color-button__wrapper')}
                style={
                  {
                    '--color-button': '#A9A9AB',
                  } as React.CSSProperties
                }
                onClick={() => changeHighlightForSeveralShapes(false)}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='none'
                >
                  <rect
                    x='0.6'
                    y='0.6'
                    width='14.8'
                    height='14.8'
                    rx='7.4'
                    stroke='#A9A9AB'
                    strokeWidth='1.2'
                  />
                  <path
                    d='M13.5 2.5L2.5 13.5'
                    stroke='#A9A9AB'
                    strokeWidth='1.2'
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className='divider' />
    </>
  );
};

export default TextHighlight;
