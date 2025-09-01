import {
  TLDokablyAlign,
  TLDokablyColor,
  TLDokablyFill,
  TLDokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';
import { TLShape } from '@tldraw/tlschema';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './style.css';
import cn from 'classnames';
import { TLUnknownShape, useEditor, useValue } from '@tldraw/editor';
import {
  createQuill,
  getQuillForShape,
} from '@app/utils/whiteboard/quill/utils';
import { TextHelpers } from '@app/utils/whiteboard/text';

export const TEXT_PROPS = {
  lineHeight: 1.35,
  fontWeight: 'normal',
  fontVariant: 'normal',
  fontStyle: 'normal',
  padding: '0px',
  maxWidth: 'auto',
};

export const TextContentForCustomShape = React.memo(
  function TextContentForCustomShape<
    T extends Extract<
      TLShape,
      { props: { text: string; w: number; h: number } }
    >,
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
    forceFocus = false,
    limitedBounds = true,
    placeholder = null,
    editingShape = null,
    textContents = '',
    className,
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
    forceFocus?: boolean;
    limitedBounds?: boolean;
    placeholder?: string | null;
    editingShape?: string | null;
    textContents: string;
    className?: string;
  }) {
    const editor = useEditor();

    const onlySelectedShape = editor.getOnlySelectedShape() as TLShape | null;

    const isLocked = onlySelectedShape
      ? editor.isShapeOrAncestorLocked(onlySelectedShape)
      : false;

    const quillRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
    const quill = getQuillForShape(id);
    if (!quill) return;
    const quillText = quill.getText();

    // Don't overwrite existing content if textContents is available
    if (textContents && textContents.length > 0) return;
    
    // Only set plain text if no content exists and no formatted content is available
    if (quillText && quillText !== '\n') return;
    if (!text) return;

    quill.setText(text);
  }, [text, id, textContents]);

      useLayoutEffect(() => {
    if (!quillRef?.current) return;

    const options = {
      modules: {
        toolbar: '#whiteboard-toolbar',
      },
      ...(placeholder ? { placeholder } : {}),
    };

    const quill = createQuill(quillRef.current, options, id, textContents);

    if (!editingShape || isLocked) {
      quill.disable();
    } else {
      quill.enable();
      const quillText = quill.getText();

      if (quillText && quillText === '\n') {
        quill.setSelection(0, 0);
      }
    }

    quill.on('text-change', (delta, oldDelta, source) => {
      // Only process user changes, not API changes (like initial content loading)
      if (source !== 'user') return;
      
      const text = quill.getText();
      let textToUse = TextHelpers.normalizeText(text);

      // Get formatted content for saving
      const contents = quill.getContents();
      const textContentsJson = JSON.stringify(contents);

      editor.updateShapes<TLUnknownShape & { props: { text: string; textContents: string } }>([
        { id, type, props: { text: textToUse, textContents: textContentsJson } },
      ]);
    });
  }, [editingShape, isLocked, placeholder, editor, id, type]);

    const quill = getQuillForShape(id);

    if (quill) {
      if (!editingShape || isLocked) {
        quill.disable();
      } else {
        quill.enable();
      }
    }

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
      horizontalAlign: getHorizontalAlignCSS(),
      '--ql-verticalAlign': getVerticalAlignCSS(),
      display: 'flex',
      'line-height': TEXT_PROPS.lineHeight * fontSize + 'px',
      '--ql-child-horizontalAlign': getChildPHorizontalAlignCSS(),
    } as React.CSSProperties;

    return (
      <div
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
          className={cn(
            {
              none: !(editingShape && !isLocked),
              limitedBounds: limitedBounds,
              'ql-disabled': editingShape && !isLocked,
              noUserHighlight: !editingShape || isLocked,
            },
            className
          )}
          contentEditable={!!editingShape && !isLocked}
        />
      </div>
    );
  }
);
