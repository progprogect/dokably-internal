import {
  BaseBoxShapeUtil,
  Box,
  Editor,
  Geometry2d,
  Rectangle2d,
  TLOnEditEndHandler,
  TLOnResizeEndHandler,
  TLOnResizeHandler,
  Vec,
  resizeBox,
  useValue,
} from '@tldraw/editor';
import { ICustomText } from './custom-text-types';

import 'react-quill/dist/quill.bubble.css';
import { TEXT_PROPS } from '../text-label';
import { useEffect, useRef, useState } from 'react';
import { customTextProps } from './custom-text-props';
import { CUSTOM_TEXT_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { getQuillForShape } from '@app/utils/whiteboard/quill/utils';
import {
  DEFAULT_FONT_SIZE,
  CUSTOM_TEXT_SHAPE_DEFAULT_WIDTH,
} from '@app/constants/whiteboard/constants';
import { DokablyTextColor } from '@app/constants/whiteboard/whiteboard-styles';
import { TextContentForCustomShape } from '../text-content-for-custom-shape/TextContentForCustomShape';
import { useTextMesurements } from '../useTextMesurements';
import _ from 'lodash';
import { showLinkPanelIfNeeded } from '@widgets/whiteboard/text-link/utils';

export class CustomTextUtil extends BaseBoxShapeUtil<ICustomText> {
  static override type = CUSTOM_TEXT_SHAPE_ID;
  static override props = customTextProps;

  override isAspectRatioLocked = (_shape: ICustomText) => false;
  override canResize = (_shape: ICustomText) => true;
  override canBind = (_shape: ICustomText) => true;
  override canEdit = () => true;

  getDefaultProps(): ICustomText['props'] {
    return {
      w: CUSTOM_TEXT_SHAPE_DEFAULT_WIDTH,
      h: 18,
      color: DokablyTextColor.defaultValue,
      fill: 'transparent',
      size: 's',
      fontFamily: 'Euclid Circular A',
      fontSize: DEFAULT_FONT_SIZE,
      text: '',
      align: 'left',
      verticalAlign: 'middle',
      url: '',
      textContents: '',
      autoSize: true,
    };
  }

  getGeometry(shape: ICustomText): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  getBounds(shape: ICustomText) {
    return new Box(0, 0, shape.props.w, shape.props.h);
  }

  getCenter(shape: ICustomText) {
    return new Vec(shape.props.w / 2, shape.props.h / 2);
  }

  onBeforeCreate = (shape: ICustomText) => {
    // Only center if the shape is empty when created.
    if (shape.props.text.trim()) return;
    const bounds = getTextSize(this.editor, shape);
    return {
      ...shape,
      x: shape.x + bounds.width / 2,
    };
  };

  component(shape: ICustomText) {
    const { id } = shape;
    const bounds = this.editor.getShapeGeometry(shape).bounds;
    const containerRef = useRef<HTMLDivElement>(null);
    const [editingShapeLocal, setEditingShapeLocal] = useState<string | null>(
      null,
    );

    useEffect(() => {
      const editAfterCreating = () => {
        const isSelected = this.editor.getOnlySelectedShapeId() === shape.id;
        if (isSelected) {
          setEditingShapeLocal(shape.id);
        }
      };
      editAfterCreating();
    }, []);

    const isLocked = useValue(
      'isLocked',
      () => this.editor.isShapeOrAncestorLocked(shape.id),
      [this.editor, shape.id],
    );

    const handleClick: React.PointerEventHandler<HTMLDivElement> = (e) => {
      const isSelected = this.editor.getSelectedShapeIds().includes(shape.id);
      const editingShapeId = this.editor.getEditingShapeId();

      const isEditing =
        editingShapeId === shape.id || editingShapeLocal === shape.id;

      if (!isSelected) {
        this.editor.select(shape.id);
        this.editor.setEditingShape(null);
        setEditingShapeLocal(null);
        showLinkPanelIfNeeded(e.target as Element);
        if (isLocked) {
          e.stopPropagation();
        }
        return;
      }

      if (isSelected && !isEditing) {
        setEditingShapeLocal(shape.id);
        this.editor.setSelectedShapes([]);

        setTimeout(() => {
          const currentToolState = this.editor
            .getCurrentTool()
            .getCurrent()?.id;

          const isTranslating = currentToolState === 'translating';
          const isPointing = currentToolState === 'pointing_shape';

          if (isTranslating || isPointing) {
            const clearHighlightingWhenTranslating = () => {
              const quill = getQuillForShape(shape.id);
              if (quill) {
                quill.disable();
                quill.blur();
              }
            };
            clearHighlightingWhenTranslating();

            setEditingShapeLocal(null);
            this.editor.setEditingShape(null);
            return;
          }

          this.editor.setEditingShape(shape.id);
        }, 200);

        return;
      }

      if (isSelected && isEditing) {
        setTimeout(() => {
          this.editor.getCurrentTool().transition('idle');
        }, 10);
        return;
      }
    };

    useTextMesurements({
      shape: CUSTOM_TEXT_SHAPE_ID,
      shapeHeight: bounds.h,
      shapeWidth: bounds.w,
    });

    return (
      <div
        onPointerDown={handleClick}
        style={{
          position: 'absolute',
          width: bounds.w,
          height: bounds.h,
        }}
      >
        <div
          id={`text-shape-${shape.id}`}
          ref={containerRef}
          className='tl-note__container tl-hitarea-fill h-fit'
          style={{
            color: shape.props.color as string,
            borderRadius: 0,
            opacity: 1,
          }}
        >
          <TextContentForCustomShape
            placeholder='Type something'
            editingShape={editingShapeLocal}
            id={id}
            //@ts-ignore
            type={CUSTOM_TEXT_SHAPE_ID}
            fontFamily={shape.props.fontFamily}
            fontSize={shape.props.fontSize}
            fill={shape.props.fill}
            align={shape.props.align}
            verticalAlign={shape.props.verticalAlign}
            text={shape.props.text}
            labelColor={shape.props.color}
            h={shape.props.h}
            w={shape.props.w}
            limitedBounds={false}
            className='max-w-full w-full pl-1 [&>.ql-editor]:min-h-fit'
            textContents={shape.props.textContents}
            wrap
          />
        </div>
      </div>
    );
  }

  indicator(shape: ICustomText) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
      />
    );
  }

  override onResize: TLOnResizeHandler<ICustomText> = (shape, info) => {
    const { newPoint, initialBounds, initialShape, scaleX, scaleY, handle } =
      info;
    if (handle !== 'right' && handle !== 'left') {
      const aspectRatio = initialBounds.width / initialBounds.height;
      const nextWidth = Math.max(1, Math.abs(initialBounds.width * scaleX));
      const nextHeight = nextWidth / aspectRatio;
      const { x, y } =
        scaleX < 0
          ? Vec.Sub(newPoint, Vec.FromAngle(shape.rotation).mul(nextWidth))
          : newPoint;

      return {
        id: shape.id,
        type: shape.type,
        x,
        y,
        props: {
          w: nextWidth,
          h: nextHeight,
          fontSize: Math.round(shape.props.fontSize * scaleX),
          autoSize: false,
        },
      };
    }

    const result = resizeBox(shape, info);

    return {
      ...result,
      props: { ...result.props, autoSize: false },
    };
  };

  onBeforeUpdate = (prev: ICustomText, next: ICustomText) => {
    const styleDidChange =
      prev.props.size !== next.props.size ||
      prev.props.align !== next.props.align ||
      prev.props.fontFamily !== next.props.fontFamily ||
      prev.props.fontSize !== next.props.fontSize;

    const sizeDidChange =
      prev.props.h !== next.props.h || prev.props.w !== next.props.w;

    const textDidChange = prev.props.text !== next.props.text;

    if (prev.props.text.length === 0 && sizeDidChange) return;

    // Only update position if either changed
    if (!styleDidChange && !textDidChange && !sizeDidChange) return;

    // Might return a cached value for the bounds
    const boundsA = getTextSize(this.editor, prev);

    // Will always be a fresh call to getTextSize
    const boundsB = getTextSize(this.editor, next);

    const hA = boundsA.height;
    const wB = boundsB.width;
    const hB = boundsB.height;

    let height: number = hB;
    let delta: Vec | undefined;
    let additional = {};

    if (sizeDidChange) {
      if (next.props.autoSize) {
        height = next.props.h;
      }
    }

    if (!textDidChange) {
      delta = new Vec(0, (hB - hA) / 2);
    }

    if (delta) {
      // account for shape rotation when writing text:
      delta.rot(next.rotation);
      const { x, y } = next;
      return {
        ...next,
        x: x - delta.x,
        y: y - delta.y,
        props: { ...next.props, w: next.props.w, h: height, ...additional },
      };
    } else {
      return {
        ...next,
        props: {
          ...next.props,
          w: next.props.autoSize ? wB : next.props.w,
          h: height,
          ...additional,
        },
      };
    }
  };

  onResizeEnd: TLOnResizeEndHandler<ICustomText> = (shape) => {
    const quill = getQuillForShape(shape.id);

    if (!quill) return;

    quill.enable();
    quill.focus();
  };

  onEditEnd: TLOnEditEndHandler<ICustomText> = (shape) => {
    const {
      id,
      type,
      props: { text },
    } = shape;

    const doc = new DOMParser().parseFromString(text || '', 'text/html');
    const textWithOutHtmlTags = doc.body.textContent;

    if (!textWithOutHtmlTags) {
      this.editor.deleteShape(id);
      return;
    }

    const quill = getQuillForShape(shape.id);
    let textContents = shape.props.textContents || '';

    // Always update textContents from current Quill state if available
    if (quill) {
      const contents = quill.getContents();
      const contentsJson = JSON.stringify(contents);
      textContents = contentsJson;
    }

    // Update shape with latest text and textContents
    if (text.trimEnd() !== shape.props.text || textContents !== shape.props.textContents) {
      this.editor.updateShapes([
        {
          id,
          type,
          props: {
            text: text.trimEnd(),
            textContents,
          },
        },
      ]);
    }
  };
}

function getTextSize(editor: Editor, shape: ICustomText) {
  const { text, autoSize } = shape.props;

  const scrollableBlock = getScrollableBlock(shape);
  const minWidth = autoSize
    ? CUSTOM_TEXT_SHAPE_DEFAULT_WIDTH
    : Math.max(16, scrollableBlock.width);
  return {
    width:
      !text || text.length === 0 ? CUSTOM_TEXT_SHAPE_DEFAULT_WIDTH : minWidth,
    height: scrollableBlock.height,
  };
}

const getScrollableBlock = (shape: ICustomText) => {
  const elm = getEditorTemplate(shape);

  document.body.appendChild(elm);

  const bounds = elm.getBoundingClientRect();

  const rect = {
    height: elm.scrollHeight,
    width: bounds.width,
  };

  document.body.removeChild(elm);

  return rect;
};

const getEditorTemplate = (shape: ICustomText) => {
  const { text, fontSize, fontFamily, w: width } = shape.props;
  const elm = document.createElement('div');
  elm.innerHTML = text;

  elm.setAttribute('dir', 'ltr');
  elm.style.setProperty('font-family', fontFamily);
  elm.style.setProperty('font-weight', TEXT_PROPS.fontWeight);
  elm.style.setProperty('font-size', fontSize + 'px');
  elm.style.setProperty('line-height', TEXT_PROPS.lineHeight * fontSize + 'px');
  elm.style.setProperty('width', width + 'px');
  elm.style.setProperty('max-width', 'fit-content');
  elm.style.setProperty('padding', TEXT_PROPS.padding);
  elm.style.setProperty('position', 'absolute');
  elm.style.setProperty('display', 'block');
  elm.style.setProperty('top', '-9999px');
  elm.style.setProperty('left', '-9999px');
  elm.style.setProperty('top', '0px');
  elm.style.setProperty('left', '0px');
  elm.style.setProperty('white-space', 'pre-wrap');
  elm.style.setProperty('word-wrap', 'break-word');
  elm.style.setProperty('min-height', 'fit-content');
  elm.style.setProperty('padding-left', '4px');

  return elm;
};
