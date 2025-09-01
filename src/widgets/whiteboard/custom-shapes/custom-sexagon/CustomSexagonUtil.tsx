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
import { ICustomSexagon } from './custom-sexagon-types';
import { getTextLabelSvgElement } from '@app/utils/whiteboard/getTextLabelSvgElement';
import { getFontDefForExport } from '@app/utils/whiteboard/getFontDefForExport';
import { SvgExportContext } from '@app/utils/whiteboard/SvgExportContext';
import { HyperlinkButton } from '@app/utils/whiteboard/HypelinkButton';
import { useEffect, useState } from 'react';
import { customSexagonProps } from './custom-sexagon-props';
import { CUSTOM_SEXAGON_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { getQuillForShape } from '@app/utils/whiteboard/quill/utils';
import { CUSTOM_SEXAGON_SHAPE_DEFAULT_HEIGHT, CUSTOM_SEXAGON_SHAPE_DEFAULT_WIDTH } from '@app/constants/whiteboard/constants';
import { useTextMesurements } from '../useTextMesurements';
import { DokablyTextColor } from '@app/constants/whiteboard/whiteboard-styles';
import { TextContentForCustomShape } from '../text-content-for-custom-shape/TextContentForCustomShape';
import { showLinkPanelIfNeeded } from '@widgets/whiteboard/text-link/utils';

export class CustomSexagonUtil extends ShapeUtil<ICustomSexagon> {
  static override type = CUSTOM_SEXAGON_SHAPE_ID;
  static override props = customSexagonProps;
  canEdit = () => true;
  override isAspectRatioLocked = (_shape: ICustomSexagon) => false;
  override canResize = (_shape: ICustomSexagon) => true;
  override canBind = (_shape: ICustomSexagon) => true;

  getGeometry(shape: ICustomSexagon): Geometry2d {
    return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
  }

  getDefaultProps(): ICustomSexagon['props'] {
    return {
      w: CUSTOM_SEXAGON_SHAPE_DEFAULT_WIDTH,
      h: CUSTOM_SEXAGON_SHAPE_DEFAULT_HEIGHT,
      color: DokablyTextColor.defaultValue,
      borderColor: '#29282C',
      fill: 'transparent',
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

  getBounds(shape: ICustomSexagon) {
    return new Box(0, 0, shape.props.w, shape.props.h);
  }

  getCenter(shape: ICustomSexagon) {
    return new Vec(shape.props.w / 2, shape.props.h / 2);
  }

  component(shape: ICustomSexagon) {
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
    } = useTextMesurements({
      shape: CUSTOM_SEXAGON_SHAPE_ID,
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
              viewBox='0 0 88 100'
              fill={(shape.props.fill as string) || 'none'}
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M1.69873 25.5774L44 1.1547L86.3013 25.5774V74.4226L44 98.8453L1.69873 74.4226V25.5774Z'
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
            viewBox='0 0 88 100'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M1.69873 25.5774L44 1.1547L86.3013 25.5774V74.4226L44 98.8453L1.69873 74.4226V25.5774Z' />
          </svg>
          <div
            style={{
              maxHeight: textHeight,
              maxWidth: textWidth,
              width: '100%',
              height: '100%',
              transform: `translate(${bounds.w * 0.5 - textWidth * 0.5}px, ${bounds.h * 0.5 - textHeight * 0.5}px)`,
            }}
          >
            <TextContentForCustomShape
              editingShape={editingShapeLocal}
              id={id}
              //@ts-ignore
              type={CUSTOM_SEXAGON_SHAPE_ID}
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

  indicator(shape: ICustomSexagon) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  // Events
  override onResize: TLOnResizeHandler<ICustomSexagon> = (shape, info) => {
    return resizeBox(shape, info);
  };

  onResizeEnd: TLOnResizeEndHandler<ICustomSexagon> = (shape) => {
    this.editor.setEditingShape(shape.id);
    const quill = getQuillForShape(shape.id);

    if (!quill) return;

    quill.enable();
    quill.focus();
  };

  onEditEnd: TLOnEditEndHandler<ICustomSexagon> = (shape) => {
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
