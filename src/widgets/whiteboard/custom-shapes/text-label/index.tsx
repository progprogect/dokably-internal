import {
  TLDokablyAlign,
  TLDokablyColor,
  TLDokablyFill,
  TLDokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';
import { useQuillTextEditing } from '@app/hooks/whiteboard/useQuillTextEditing';
import { TLShape } from '@tldraw/tlschema';
import React, { useEffect, useRef } from 'react';
import './style.css';
import cn from 'classnames';
import { useEditor } from '@tldraw/editor';
import { createQuill } from '@app/utils/whiteboard/quill/utils';

export const TEXT_PROPS = {
  lineHeight: 1.35,
  fontWeight: 'normal',
  fontVariant: 'normal',
  fontStyle: 'normal',
  padding: '0px',
  maxWidth: 'auto',
};

export const TextLabel = React.memo(function TextLabel<
  T extends Extract<TLShape, { props: { text: string; w: number; h: number } }>
>({
  id,
  type,
  text,
  labelColor = '#29282C',
  fill,
  fontFamily,
  fontSize = 12,
  align,
  verticalAlign,
  wrap,
  w,
  h,
  parrentRef,
  forceFocus = false,
  limitedBounds = true,
  placeholder = null,
}: {
  id: T['id'];
  type: T['type'];
  fontFamily: string;
  fill?: TLDokablyFill;
  align: TLDokablyAlign;
  verticalAlign: TLDokablyVerticalAlign;
  wrap?: boolean;
  text: string;
  labelColor?: TLDokablyColor;
  w: number;
  h: number;
  fontSize?: number;
  parrentRef: React.RefObject<HTMLElement>;
  forceFocus?: boolean;
  limitedBounds?: boolean;
  placeholder?: string | null;
}) {
  const {
    rInput,
    isEmpty,
    isEditing,
    handleFocus,
    handleChange,
    handleKeyDown,
    handleBlur,
  } = useQuillTextEditing(id, type, text);

  const witeboardEditor = useEditor();
  const onlySelectedShape =
    witeboardEditor.getOnlySelectedShape() as TLShape | null;
  const isLocked = onlySelectedShape
    ? witeboardEditor.isShapeOrAncestorLocked(onlySelectedShape)
    : false;

  const quillRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rInput && rInput.current && quillRef && quillRef.current) {
      let options: any = {};
      const value = rInput.current.value;
      quillRef.current.innerHTML = value;
      rInput.current.style.display = 'none';
      options = {
        modules: {
          toolbar: '#whiteboard-toolbar',
        },
        ...(placeholder ? { placeholder } : {}),
      };

      const editor = createQuill(quillRef.current, options, id);

      editor.on('text-change', function () {
        let text = editor.root.innerHTML;
        rInput.current!.value = text;

        let nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value'
        )!.set;
        //Почему-то не срабатывает событие, если отправлять просто текст
        nativeInputValueSetter!.call(rInput.current, ' ' + text);

        let inputEvent = new Event('input', { bubbles: true });
        rInput.current!.dispatchEvent(inputEvent);
      });

      if (isEditing && !editor.hasFocus() && !isLocked) {
        editor.focus()
        const textLength = editor.getText().length;
        editor.setSelection(textLength, 0)
      }

      const isEnable = isEditing && !isLocked;
      editor.enable(isEnable);
    }
  }, [rInput, quillRef, isEditing, toolbarRef, isLocked, placeholder]);

  const ref = useRef<HTMLDivElement>(null);

  const getVerticalAlignCSS = () => {
    if (verticalAlign === 'top') return 'flex-start';
    if (verticalAlign === 'bottom') return 'flex-end';
    return 'center';
  };

  const getHorizontalAlignCSS = () => {
    if (align === 'left') return 'flex-start';
    if (align === 'right') return 'flex-end';
    return 'center';
  };

  const getChildPHorizontalAlignCSS = () => {
    if (align === 'left') return 'left';
    if (align === 'right') return 'right';
    return 'center';
  };

  const textBlockStyle = {
    '--ql-fontFamily': fontFamily,
    '--ql-fontSize': `${fontSize}px`,
    '--ql-horizontalAlign': getHorizontalAlignCSS(),
    '--ql-verticalAlign': getVerticalAlignCSS(),
    '--ql-line-height': TEXT_PROPS.lineHeight * fontSize + 'px',
    '--ql-child-horizontalAlign': getChildPHorizontalAlignCSS(),
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      style={
        {
          width: '100%',
          height: '100%',
          color: (labelColor ?? 'black').toString(),
          ...textBlockStyle,
        } as any
      }
    >
      <div
        ref={quillRef}
        id={`${id}-quill`}
        className={cn({
          none: !(isEditing && !isLocked),
          limitedBounds: limitedBounds,
        })}
      />
      <div className='h-[100%]'>
        <textarea
          ref={rInput}
          className='tl-text tl-text-input display-none'
          name='text'
          tabIndex={-1}
          autoComplete='false'
          autoCapitalize='false'
          autoCorrect='false'
          autoSave='false'
          autoFocus={isEditing}
          placeholder=''
          spellCheck='true'
          wrap='off'
          dir='ltr'
          datatype='wysiwyg'
          defaultValue={text}
          onFocus={handleFocus}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onTouchEnd={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
});
