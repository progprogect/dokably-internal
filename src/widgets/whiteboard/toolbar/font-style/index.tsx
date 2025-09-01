import { useClickOutside } from '@app/hooks/useClickOutside';
import { ReactComponent as TextStyle } from '@icons/text-styles.svg';
import { ReactComponent as BoldIcon } from '@icons/bold.svg';
import { ReactComponent as ItalicIcon } from '@icons/italic.svg';
import { ReactComponent as UnderlineIcon } from '@icons/underline.svg';
import { ReactComponent as StrikethroughIcon } from '@icons/strikethrough.svg';
import cn from 'classnames';
import { useEditor, useValue } from '@tldraw/editor';
import Tippy from '@tippyjs/react';
import { getQuillForShape } from '@app/utils/whiteboard/quill/utils';
import Quill, { RangeStatic } from 'quill';
import { useMemo } from 'react';
import { useSelectedShapes } from '@app/utils/whiteboard/useSelectedShapes';

export const FontStyle = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);

  const editor = useEditor();

  const selectedShapes = useSelectedShapes();

  const activeShape = selectedShapes[0];

  const isEditing = useValue(
    'isEditing',
    () => editor.getEditingShape()?.id === activeShape.id,
    [editor, activeShape.id]
  );

  const changeStyleIfRangeSelected = (style: string, range: RangeStatic, quill: Quill, isNeedToRemoveStyle: boolean) => {
    if (!quill) return;

    if (isEditing) {
      if (range.length === 0) {
        quill.format(style, !isNeedToRemoveStyle);
      } else {
        quill.formatText(range, style, !isNeedToRemoveStyle);
      }
    } else {
      const length = quill.getText().length;
      quill.formatText({ index: 0, length }, style, !isNeedToRemoveStyle);
    }
  }

  const changeStyleIfRangeNotSelected = (style: string, quill: Quill, isNeedToRemoveStyle: boolean) => {
    if (!quill) return;

    const length = quill.getText().length;

    quill.formatText({ index: 0, length: length }, style, !isNeedToRemoveStyle);
  }

  const onFontStyleChange = (style: string, quill: Quill, isNeedToRemoveStyle: boolean) => {
    if (!quill) return;

    const range = quill.getSelection();
    const text = quill.getText();

    if (range) {
      changeStyleIfRangeSelected(style, range, quill, isNeedToRemoveStyle);
    } else if (text) {
      changeStyleIfRangeNotSelected(style, quill, isNeedToRemoveStyle);
    }
  };

  const checkIfNeedToRemoveStyle = (quill: Quill, style: string) => {
    if (!quill) return;
    const range = quill.getSelection();
    const text = quill.getText();
    let format;

    if (range) {
      format = quill.getFormat(range);
    } else if (text) {
      const length = quill.getText().length;
      format = quill.getFormat(0, length);
    }

    return !!format?.[style];
  }

  const changeFontStyleForSeveralShapes = (style: string) => {
    const quillInstances = selectedShapes.map((shape) => getQuillForShape(shape.id));
    const isNeedToRemoveStyle = quillInstances.map((item) => checkIfNeedToRemoveStyle(item, style)).some(Boolean);
    quillInstances.forEach((quillInstance) => onFontStyleChange(style, quillInstance, isNeedToRemoveStyle));
  };

  const showFontStyleBtn = useMemo(
    () =>
      !!(selectedShapes || []).length &&
      selectedShapes.every((shape) =>
        Object(shape.props).hasOwnProperty('text')
      ),
    [selectedShapes]
  );

  if (!showFontStyleBtn) return null;

  return (
    (
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
          content='Font style'
          className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
        >
          <div>
            <TextStyle />
          </div>
        </Tippy>
        {isVisible && (
          <div className='toolbar-list'>
            <Tippy
              duration={0}
              content='Bold'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
            >
              <div
                className={cn('toolbar-item', 'ql-bold')}
                onClick={() => changeFontStyleForSeveralShapes('bold')}
              >
                <BoldIcon />
              </div>
            </Tippy>
            <Tippy
              duration={0}
              content='Italic'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
            >
              <div
                className={cn('toolbar-item', 'ql-italic')}
                onClick={() => changeFontStyleForSeveralShapes('italic')}
              >
                <ItalicIcon />
              </div>
            </Tippy>
            <Tippy
              duration={0}
              content='Underline'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
            >
              <div
                className={cn('toolbar-item', 'ql-underline')}
                onClick={() => changeFontStyleForSeveralShapes('underline')}
              >
                <UnderlineIcon />
              </div>
            </Tippy>
            <Tippy
              duration={0}
              content='Strikethrough'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
            >
              <div
                className={cn('toolbar-item', 'ql-format-button', 'ql-strike')}
                onClick={() => changeFontStyleForSeveralShapes('strike')}
              >
                <StrikethroughIcon />
              </div>
            </Tippy>
          </div>
        )}
      </div>
    )
  );
};

export default FontStyle;
