import {
  Box,
  Geometry2d,
  Rectangle2d,
  SVGContainer,
  ShapeUtil,
  TLOnEditEndHandler,
  TLOnResizeEndHandler,
  TLOnResizeHandler,
  Vec,
  resizeBox,
  useValue,
} from '@tldraw/editor';
import { ICustomBubble } from './custom-bubble-types';
import { getTextLabelSvgElement } from '@app/utils/whiteboard/getTextLabelSvgElement';
import { getFontDefForExport } from '@app/utils/whiteboard/getFontDefForExport';
import { SvgExportContext } from '@app/utils/whiteboard/SvgExportContext';
import { HyperlinkButton } from '@app/utils/whiteboard/HypelinkButton';
import { useEffect, useState } from 'react';
import { customBubbleProps } from './custom-bubble-props';
import { CUSTOM_BUBBLE_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { getQuillForShape } from '@app/utils/whiteboard/quill/utils';
import { CUSTOM_BUBBLE_SHAPE_DEFAULT_HEIGHT, CUSTOM_BUBBLE_SHAPE_DEFAULT_WIDTH } from '@app/constants/whiteboard/constants';
import { useTextMesurements } from '../useTextMesurements';
import { DokablyTextColor } from '@app/constants/whiteboard/whiteboard-styles';
import { TextContentForCustomShape } from '../text-content-for-custom-shape/TextContentForCustomShape';
import { showLinkPanelIfNeeded } from '@widgets/whiteboard/text-link/utils';

export class CustomBubbleUtil extends ShapeUtil<ICustomBubble> {
  static override type = CUSTOM_BUBBLE_SHAPE_ID;
  static override props = customBubbleProps;
  canEdit = () => true;
  override isAspectRatioLocked = (_shape: ICustomBubble) => false;
  override canResize = (_shape: ICustomBubble) => true;
  override canBind = (_shape: ICustomBubble) => true;

  getGeometry(shape: ICustomBubble): Geometry2d {
    return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
  }

  getDefaultProps(): ICustomBubble['props'] {
    return {
      w: CUSTOM_BUBBLE_SHAPE_DEFAULT_WIDTH,
      h: CUSTOM_BUBBLE_SHAPE_DEFAULT_HEIGHT,
      color: DokablyTextColor.defaultValue,
      fill: 'transparent',
      borderColor: '#29282C',
      size: 's',
      fontFamily: 'Euclid Circular A',
      fontSize: 14,
      text: '',
      align: 'middle',
      verticalAlign: 'middle',
      url: '',
      textContents: '',
    };
  }

  getBounds(shape: ICustomBubble) {
    return new Box(0, 0, shape.props.w, shape.props.h);
  }

  getCenter(shape: ICustomBubble) {
    return new Vec(shape.props.w / 2, shape.props.h / 2);
  }

  component(shape: ICustomBubble) {
    const { id } = shape;
    const bounds =  this.editor.getShapeGeometry(shape).bounds;

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

    const {
      onRefChange,
      textHeight,
      textWidth,
      svgHeight,
    } = useTextMesurements({
      shape: CUSTOM_BUBBLE_SHAPE_ID,
      shapeHeight: bounds.h,
      shapeWidth: bounds.w,
    })

    return (
      <div>
        <div
          onPointerDown={hadleClick}
          style={{
            position: 'absolute',
            width: bounds.w,
            height: bounds.h,
          }}
        >
          <SVGContainer id={id}>
            <svg
              width={bounds.w}
              height={bounds.height}
              style={{
                color: shape.props.color as string,
                borderRadius: 0,
                opacity: 1,
              }}
              viewBox='0 0 102 95'
              fill={(shape.props.fill as string) || 'none'}
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M23.4072 73.7989V72.7989H22.4072H10.9785C6.00796 72.7989 1.97852 68.7694 1.97852 63.7989V10.9453C1.97852 5.97475 6.00795 1.94531 10.9785 1.94531H90.9785C95.9491 1.94531 99.9785 5.97475 99.9785 10.9453V63.7989C99.9785 68.7694 95.9491 72.7989 90.9785 72.7989H48.444H48.0787L47.7995 73.0343L23.4072 93.5953L23.4072 73.7989Z'
                stroke={(shape.props.borderColor as string) || 'black'}
                strokeWidth='2'
              />
            </svg>
          </SVGContainer>
          <svg
            ref={onRefChange}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              visibility: 'hidden',
              position: 'absolute',
            }}
            viewBox='0 0 102 95'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M23.4072 73.7989V72.7989H22.4072H10.9785C6.00796 72.7989 1.97852 68.7694 1.97852 63.7989V10.9453C1.97852 5.97475 6.00795 1.94531 10.9785 1.94531H90.9785C95.9491 1.94531 99.9785 5.97475 99.9785 10.9453V63.7989C99.9785 68.7694 95.9491 72.7989 90.9785 72.7989H48.444H48.0787L47.7995 73.0343L23.4072 93.5953L23.4072 73.7989Z' />
          </svg>
          <div
            style={{
              maxHeight: textHeight,
              maxWidth: textWidth,
              width: '100%',
              height: '100%',
              transform: `translate(${bounds.w / 2 - textWidth / 2}px, ${bounds.h / 2 - svgHeight / 2 + 10}px)`,
            }}
          >
            <TextContentForCustomShape
              editingShape={editingShapeLocal}
              id={id}
              //@ts-ignore
              type={CUSTOM_BUBBLE_SHAPE_ID}
              fontFamily={shape.props.fontFamily}
              fontSize={shape.props.fontSize}
              fill={shape.props.fill}
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
          {'url' in shape.props && shape.props.url && (
            <HyperlinkButton
              url={shape.props.url}
              zoomLevel={this.editor.getZoomLevel()}
            />
          )}
        </div>
      </div>
    );
  }

  indicator(shape: ICustomBubble) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  // Events
  override onResize: TLOnResizeHandler<ICustomBubble> = (shape, info) => {
    return resizeBox(shape, info);
  };

  onResizeEnd: TLOnResizeEndHandler<ICustomBubble> = (shape) => {
    this.editor.setEditingShape(shape.id);
    const quill = getQuillForShape(shape.id);

    if (!quill) return;

    quill.enable();
    quill.focus();
  };

  onEditEnd: TLOnEditEndHandler<ICustomBubble> = (shape) => {
    const {
      id,
      type,
      props: { text },
    } = shape;

    if (text.trimEnd() !== shape.props.text) {
      const quill = getQuillForShape(shape.id);

      let textContents = '';

      if (quill) {
        const contents = quill.getContents();
        const contentsJson = JSON.stringify(contents);
        textContents = contentsJson;
      }

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
