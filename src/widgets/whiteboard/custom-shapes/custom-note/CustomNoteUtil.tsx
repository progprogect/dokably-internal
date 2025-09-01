import {
  Box,
  Rectangle2d,
  ShapeUtil,
  TLOnEditEndHandler,
  TLOnResizeEndHandler,
  TLOnResizeHandler,
  Vec,
  resizeBox,
  useValue,
} from '@tldraw/editor';
import { ICustomNote } from './custom-note-types';
import { HyperlinkButton } from '@app/utils/whiteboard/HypelinkButton';
import { useEffect, useState } from 'react';
import { customNoteProps } from './custom-note-props';
import { CUSTOM_NOTE_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { getQuillForShape, setCurrentQuill } from '@app/utils/whiteboard/quill/utils';
import { DokablyNoteBgColor, DokablyTextColor } from '@app/constants/whiteboard/whiteboard-styles';
import { CUSTOM_NOTE_SHAPE_DEFAULT_HEIGHT, CUSTOM_NOTE_SHAPE_DEFAULT_WIDTH } from '@app/constants/whiteboard/constants';
import { TextContentForCustomShape } from '../text-content-for-custom-shape/TextContentForCustomShape';
import { showLinkPanelIfNeeded } from '@widgets/whiteboard/text-link/utils';

export class CustomNoteUtil extends ShapeUtil<ICustomNote> {
  static override type = CUSTOM_NOTE_SHAPE_ID;
  static override props = customNoteProps;
  canEdit = () => true;
  override isAspectRatioLocked = (_shape: ICustomNote) => false;
  override canResize = (_shape: ICustomNote) => true;
  override canBind = (_shape: ICustomNote) => true;

  getDefaultProps(): ICustomNote['props'] {
    return {
      w: CUSTOM_NOTE_SHAPE_DEFAULT_WIDTH,
      h: CUSTOM_NOTE_SHAPE_DEFAULT_HEIGHT,
      color: DokablyTextColor.defaultValue,
      fill: DokablyNoteBgColor.defaultValue,
      size: 's',
      fontFamily: 'Euclid Circular A',
      text: '',
      align: 'middle',
      verticalAlign: 'middle',
      url: '',
      fontSize: 10,
      textContents: '',
    };
  }

  getGeometry(shape: ICustomNote) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  getBounds(shape: ICustomNote) {
    return new Box(0, 0, shape.props.w, shape.props.h);
  }

  getCenter(shape: ICustomNote) {
    return new Vec(shape.props.w / 2, shape.props.h / 2);
  }

  component(shape: ICustomNote) {
    const { id } = shape;

    const bounds = this.editor.getShapeGeometry(shape).bounds;

    const [editingShapeLocal, setEditingShapeLocal] = useState<string | null>(
      null
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
      [this.editor, shape.id]
    );

    const hadleClick: React.PointerEventHandler<HTMLDivElement> = (e) => {
      const isSelected = this.editor.getSelectedShapeIds().includes(shape.id);
      const editingShapeId = this.editor.getEditingShapeId();

      const isEditing =
        editingShapeId === shape.id || editingShapeLocal === shape.id;

      if (!isSelected) {
        this.editor.select(shape.id);
        this.editor.setEditingShape(null);
        setEditingShapeLocal(null);
        showLinkPanelIfNeeded(e.target as Element)

        if (isLocked) {
          e.stopPropagation();
        }
        return;
      }

      if (isSelected && !isEditing) {
        setEditingShapeLocal(shape.id);
        this.editor.setSelectedShapes([]);

        setTimeout(() => {
          const currentToolState = this.editor.getCurrentTool().getCurrent()?.id;

          const isTranslating = currentToolState === 'translating';
          const isPointing = currentToolState === 'pointing_shape';

          if (isTranslating || isPointing) {
            const clearHighlightingWhenTranslating = () => {
              const quill = getQuillForShape(shape.id);
              if (quill) {
                quill.disable();
                quill.blur();
              }
            }
            clearHighlightingWhenTranslating()
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

    return (
      <div
        style={{
          width: bounds.w,
          height: bounds.h,
        }}
      >
        <div
          onPointerDown={hadleClick}
          style={{
            position: 'absolute',
            width: bounds.w,
            height: bounds.h,
          }}
        >
          <div
            className='tl-note__container tl-hitarea-fill'
            style={{
              color: shape.props.color as string,
              border: 'none',
              backgroundColor: shape.props.fill as string,
              opacity: 1,
              boxShadow: 'var(--note-box-shadow)',
            }}
          >
            <TextContentForCustomShape
              editingShape={editingShapeLocal}
              id={id}
              //@ts-ignore
              type={CUSTOM_NOTE_SHAPE_ID}
              fontFamily={shape.props.fontFamily}
              fill={shape.props.fill}
              fontSize={shape.props.fontSize}
              align={shape.props.align}
              verticalAlign={shape.props.verticalAlign}
              text={shape.props.text}
              labelColor={shape.props.color}
              h={shape.props.h}
              w={shape.props.w}
              textContents={shape.props.textContents}
              wrap
            />
          </div>
        </div>
        {'url' in shape.props && shape.props.url && (
          <HyperlinkButton
            url={shape.props.url}
            zoomLevel={this.editor.getZoomLevel()}
          />
        )}
      </div>
    );
  }

  indicator(shape: ICustomNote) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  // Events
  override onResize: TLOnResizeHandler<ICustomNote> = (shape, info) => {
    return resizeBox(shape, info);
  };

  onResizeEnd: TLOnResizeEndHandler<ICustomNote> = (shape) => {
    this.editor.setEditingShape(shape.id);
    const quill = getQuillForShape(shape.id);

    if (!quill) return;

    quill.enable();
    quill.focus();
  };

  onEditEnd: TLOnEditEndHandler<ICustomNote> = (shape) => {
    const {
      id,
      type,
      props: { text },
    } = shape;

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
