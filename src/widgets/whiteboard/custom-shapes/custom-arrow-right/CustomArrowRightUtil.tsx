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
import { ICustomArrowRight } from './custom-arrow-right-types';
import { getTextLabelSvgElement } from '@app/utils/whiteboard/getTextLabelSvgElement';
import { getFontDefForExport } from '@app/utils/whiteboard/getFontDefForExport';
import { SvgExportContext } from '@app/utils/whiteboard/SvgExportContext';
import { HyperlinkButton } from '@app/utils/whiteboard/HypelinkButton';
import { useEffect, useRef, useState } from 'react';
import { customArrowRightProps } from './custom-arrow-right-props';
import { CUSTOM_ARROW_RIGHT_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { getQuillForShape, setCurrentQuill } from '@app/utils/whiteboard/quill/utils';
import { CUSTOM_ARROW_RIGHT_SHAPE_DEFAULT_HEIGHT, CUSTOM_ARROW_RIGHT_SHAPE_DEFAULT_WIDTH } from '@app/constants/whiteboard/constants';
import { useTextMesurements } from '../useTextMesurements';
import { DokablyTextColor } from '@app/constants/whiteboard/whiteboard-styles';
import { TextContentForCustomShape } from '../text-content-for-custom-shape/TextContentForCustomShape';
import { showLinkPanelIfNeeded } from '@widgets/whiteboard/text-link/utils';

export class CustomArrowRightUtil extends ShapeUtil<ICustomArrowRight> {
  static override type = CUSTOM_ARROW_RIGHT_SHAPE_ID;
  static override props = customArrowRightProps;
  canEdit = () => true;
  override isAspectRatioLocked = (_shape: ICustomArrowRight) => false;
  override canResize = (_shape: ICustomArrowRight) => true;
  override canBind = (_shape: ICustomArrowRight) => true;

  getGeometry(shape: ICustomArrowRight): Geometry2d {
    return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
  }

  getDefaultProps(): ICustomArrowRight['props'] {
    return {
      w: CUSTOM_ARROW_RIGHT_SHAPE_DEFAULT_WIDTH,
      h: CUSTOM_ARROW_RIGHT_SHAPE_DEFAULT_HEIGHT,
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

  getBounds(shape: ICustomArrowRight) {
    return new Box(0, 0, shape.props.w, shape.props.h);
  }

  getCenter(shape: ICustomArrowRight) {
    return new Vec(shape.props.w / 2, shape.props.h / 2);
  }

  component(shape: ICustomArrowRight) {
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

    const {
      onRefChange,
      textHeight,
      textWidth,
      svgWidth,
      svgHeight,
    } = useTextMesurements({
      shape: CUSTOM_ARROW_RIGHT_SHAPE_ID,
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
              viewBox='0 0 102 102'
              fill={(shape.props.fill as string) || 'none'}
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M101 51.0021L41.9792 1.95729C41.3694 1.45105 40.6297 1.13017 39.8463 1.03202C39.063 0.933863 38.2681 1.06247 37.5543 1.40285C36.8405 1.74324 36.2371 2.28141 35.8144 2.9547C35.3917 3.62798 35.1671 4.40868 35.1667 5.2059V22.3832H1L1 79.6126L35.1667 79.6126V96.7941C35.1671 97.5913 35.3917 98.372 35.8144 99.0453C36.2371 99.7186 36.8405 100.257 37.5543 100.597C38.2681 100.938 39.063 101.066 39.8463 100.968C40.6297 100.87 41.3694 100.549 41.9792 100.043L101 51.0021Z'
                stroke={(shape.props.borderColor as string) || 'black'}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
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
            viewBox='0 0 102 102'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M101 51.0021L41.9792 1.95729C41.3694 1.45105 40.6297 1.13017 39.8463 1.03202C39.063 0.933863 38.2681 1.06247 37.5543 1.40285C36.8405 1.74324 36.2371 2.28141 35.8144 2.9547C35.3917 3.62798 35.1671 4.40868 35.1667 5.2059V22.3832H1L1 79.6126L35.1667 79.6126V96.7941C35.1671 97.5913 35.3917 98.372 35.8144 99.0453C36.2371 99.7186 36.8405 100.257 37.5543 100.597C38.2681 100.938 39.063 101.066 39.8463 100.968C40.6297 100.87 41.3694 100.549 41.9792 100.043L101 51.0021Z' />
          </svg>
          <div
            style={{
              maxHeight: textHeight,
              maxWidth: textWidth,
              width: '100%',
              height: '100%',
              transform: `translate(${bounds.w / 2 - svgWidth / 2 + 10}px, ${bounds.h / 2 - svgHeight * 0.25}px)`,
            }}
          >
            <TextContentForCustomShape
              editingShape={editingShapeLocal}
              id={id}
              //@ts-ignore
              type={CUSTOM_ARROW_RIGHT_SHAPE_ID}
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

  indicator(shape: ICustomArrowRight) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  // Events
  override onResize: TLOnResizeHandler<ICustomArrowRight> = (shape, info) => {
    return resizeBox(shape, info);
  };

  onResizeEnd: TLOnResizeEndHandler<ICustomArrowRight> = (shape) => {
    this.editor.setEditingShape(shape.id);
    const quill = getQuillForShape(shape.id);

    if (!quill) return;

    quill.enable();
    quill.focus();
  };

  onEditEnd: TLOnEditEndHandler<ICustomArrowRight> = (shape) => {
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
