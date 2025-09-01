import {
  Box,
  Geometry2d,
  Rectangle2d,
  SVGContainer,
  ShapeUtil,
  TLOnClickHandler,
  TLOnEditEndHandler,
  TLOnResizeEndHandler,
  TLOnResizeHandler,
  Vec,
  resizeBox,
  useValue,
} from '@tldraw/editor';
import { ICustomParallelogram } from './custom-parallelogram-types';
import { TextLabel } from '../text-label';
import { getTextLabelSvgElement } from '@app/utils/whiteboard/getTextLabelSvgElement';
import { getFontDefForExport } from '@app/utils/whiteboard/getFontDefForExport';
import { SvgExportContext } from '@app/utils/whiteboard/SvgExportContext';
import { HyperlinkButton } from '@app/utils/whiteboard/HypelinkButton';
import { useEffect, useRef, useState } from 'react';
import { customParallelogramProps } from './custom-parallelogram-props'
import { CUSTOM_PARALLELOGRAM_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { getQuillForShape, setCurrentQuill } from '@app/utils/whiteboard/quill/utils';
import { CUSTOM_PARALLELOGRAM_SHAPE_DEFAULT_HEIGHT, CUSTOM_PARALLELOGRAM_SHAPE_DEFAULT_WIDTH } from '@app/constants/whiteboard/constants';
import { useTextMesurements } from '../useTextMesurements';
import { DokablyTextColor } from '@app/constants/whiteboard/whiteboard-styles';
import { TextContentForCustomShape } from '../text-content-for-custom-shape/TextContentForCustomShape';
import { showLinkPanelIfNeeded } from '@widgets/whiteboard/text-link/utils';

export class CustomParallelogramUtil extends ShapeUtil<ICustomParallelogram> {
  static override type = CUSTOM_PARALLELOGRAM_SHAPE_ID;
  static override props = customParallelogramProps;
  canEdit = () => true;
  override isAspectRatioLocked = (_shape: ICustomParallelogram) => false;
  override canResize = (_shape: ICustomParallelogram) => true;
  override canBind = (_shape: ICustomParallelogram) => true;

  getGeometry(shape: ICustomParallelogram): Geometry2d {
    return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
  }

  getDefaultProps(): ICustomParallelogram['props'] {
    return {
      w: CUSTOM_PARALLELOGRAM_SHAPE_DEFAULT_WIDTH,
      h: CUSTOM_PARALLELOGRAM_SHAPE_DEFAULT_HEIGHT,
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

  getBounds(shape: ICustomParallelogram) {
    return new Box(0, 0, shape.props.w, shape.props.h);
  }

  getCenter(shape: ICustomParallelogram) {
    return new Vec(shape.props.w / 2, shape.props.h / 2);
  }

  component(shape: ICustomParallelogram) {
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
      shape: CUSTOM_PARALLELOGRAM_SHAPE_ID,
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
              viewBox='0 0 100 100'
              fill={(shape.props.fill as string) || 'none'}
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M1.15301 99L15.153 1H98.847L84.847 99H1.15301Z'
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
            viewBox='0 0 100 100'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M1.15301 99L15.153 1H98.847L84.847 99H1.15301Z' />
          </svg>
          <div
            style={{
              maxHeight: textHeight,
              maxWidth: textWidth,
              width: '100%',
              height: '100%',
              transform: `translate(${bounds.w * 0.5 - textWidth * 0.5}px, ${bounds.h * 0.5 - svgHeight * 0.5}px)`,
            }}
          >
            <TextContentForCustomShape
              editingShape={editingShapeLocal}
              id={id}
              //@ts-ignore
              type={CUSTOM_PARALLELOGRAM_SHAPE_ID}
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

  indicator(shape: ICustomParallelogram) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  // Events
  override onResize: TLOnResizeHandler<ICustomParallelogram> = (
    shape,
    info
  ) => {
    return resizeBox(shape, info);
  };

  onResizeEnd: TLOnResizeEndHandler<ICustomParallelogram> = (shape) => {
    this.editor.setEditingShape(shape.id);
    const quill = getQuillForShape(shape.id);

    if (!quill) return;

    quill.enable();
    quill.focus();
  };

  onEditEnd: TLOnEditEndHandler<ICustomParallelogram> = (shape) => {
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
