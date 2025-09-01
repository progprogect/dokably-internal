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
import { ICustomStar } from './custom-star-types';
import { getTextLabelSvgElement } from '@app/utils/whiteboard/getTextLabelSvgElement';
import { getFontDefForExport } from '@app/utils/whiteboard/getFontDefForExport';
import { SvgExportContext } from '@app/utils/whiteboard/SvgExportContext';
import { HyperlinkButton } from '@app/utils/whiteboard/HypelinkButton';
import { useEffect, useRef, useState } from 'react';
import { customStarProps } from './custom-star-props';
import { CUSTOM_STAR_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { getQuillForShape, setCurrentQuill } from '@app/utils/whiteboard/quill/utils';
import { CUSTOM_STAR_SHAPE_DEFAULT_HEIGHT, CUSTOM_STAR_SHAPE_DEFAULT_WIDTH } from '@app/constants/whiteboard/constants';
import { useTextMesurements } from '../useTextMesurements';
import { DokablyTextColor } from '@app/constants/whiteboard/whiteboard-styles';
import { TextContentForCustomShape } from '../text-content-for-custom-shape/TextContentForCustomShape';
import { showLinkPanelIfNeeded } from '@widgets/whiteboard/text-link/utils';

export class CustomStarUtil extends ShapeUtil<ICustomStar> {
  static override type = CUSTOM_STAR_SHAPE_ID;
  static override props = customStarProps;
  canEdit = () => true;
  override isAspectRatioLocked = (_shape: ICustomStar) => false;
  override canResize = (_shape: ICustomStar) => true;
  override canBind = (_shape: ICustomStar) => true;

  getGeometry(shape: ICustomStar): Geometry2d {
    return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
  }

  getDefaultProps(): ICustomStar['props'] {
    return {
      w: CUSTOM_STAR_SHAPE_DEFAULT_WIDTH,
      h: CUSTOM_STAR_SHAPE_DEFAULT_HEIGHT,
      color: DokablyTextColor.defaultValue,
      fill: 'transparent',
      size: 's',
      fontFamily: 'Euclid Circular A',
      borderColor: '#29282C',
      fontSize: 14,
      text: '',
      align: 'middle',
      verticalAlign: 'middle',
      url: '',
      textContents: '',
    };
  }

  getBounds(shape: ICustomStar) {
    return new Box(0, 0, shape.props.w, shape.props.h);
  }

  getCenter(shape: ICustomStar) {
    return new Vec(shape.props.w / 2, shape.props.h / 2);
  }

  component(shape: ICustomStar) {
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
      shape: CUSTOM_STAR_SHAPE_ID,
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
              viewBox='0 0 102 103'
              fill={(shape.props.fill as string) || 'none'}
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M48.207 2.92149C49.2669 0.359504 52.7332 0.359504 53.7931 2.92149L63.6242 26.6844C65.3884 30.9496 69.2259 33.8718 73.641 34.3128L98.2403 36.7697C100.893 37.0347 101.964 40.4901 99.9665 42.3384L81.443 59.482C78.1185 62.5589 76.6526 67.2872 77.6169 71.8248L82.9895 97.1064C83.5687 99.8315 80.7641 101.967 78.4701 100.548L57.191 87.3802C53.3717 85.0165 48.6284 85.0165 44.8091 87.3802L23.5301 100.548C21.2359 101.967 18.4316 99.8315 19.0108 97.1064L24.3831 71.8248C25.3474 67.2872 23.8816 62.5589 20.5569 59.482L2.03344 42.3384C0.0363222 40.4901 1.10749 37.0347 3.75967 36.7697L28.3589 34.3128C32.7742 33.8718 36.6116 30.9496 38.3761 26.6844L48.207 2.92149Z'
                stroke={(shape.props.borderColor as string) || 'back'}
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
            viewBox='0 0 102 103'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M48.207 2.92149C49.2669 0.359504 52.7332 0.359504 53.7931 2.92149L63.6242 26.6844C65.3884 30.9496 69.2259 33.8718 73.641 34.3128L98.2403 36.7697C100.893 37.0347 101.964 40.4901 99.9665 42.3384L81.443 59.482C78.1185 62.5589 76.6526 67.2872 77.6169 71.8248L82.9895 97.1064C83.5687 99.8315 80.7641 101.967 78.4701 100.548L57.191 87.3802C53.3717 85.0165 48.6284 85.0165 44.8091 87.3802L23.5301 100.548C21.2359 101.967 18.4316 99.8315 19.0108 97.1064L24.3831 71.8248C25.3474 67.2872 23.8816 62.5589 20.5569 59.482L2.03344 42.3384C0.0363222 40.4901 1.10749 37.0347 3.75967 36.7697L28.3589 34.3128C32.7742 33.8718 36.6116 30.9496 38.3761 26.6844L48.207 2.92149Z' />
          </svg>
          <div
            style={{
              maxHeight: textHeight,
              maxWidth: textWidth,
              width: '100%',
              height: '100%',
              transform: `translate(${bounds.w * 0.5 - textWidth * 0.5}px, ${bounds.h * 0.5 - textHeight * 0.33}px)`,
            }}
          >
            <TextContentForCustomShape
              editingShape={editingShapeLocal}
              id={id}
              //@ts-ignore
              type={CUSTOM_STAR_SHAPE_ID}
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

  indicator(shape: ICustomStar) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  // Events
  override onResize: TLOnResizeHandler<ICustomStar> = (shape, info) => {
    return resizeBox(shape, info);
  };

  onResizeEnd: TLOnResizeEndHandler<ICustomStar> = (shape) => {
    this.editor.setEditingShape(shape.id);
    const quill = getQuillForShape(shape.id);

    if (!quill) return;

    quill.enable();
    quill.focus();
  };

  onEditEnd: TLOnEditEndHandler<ICustomStar> = (shape) => {
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
