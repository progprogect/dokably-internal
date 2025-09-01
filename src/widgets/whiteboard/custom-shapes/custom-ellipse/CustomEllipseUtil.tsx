import {
  Box,
  Ellipse2d,
  Geometry2d,
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
import { ICustomEllipse } from './custom-ellipse-types';
import { TextLabel } from '../text-label';
import { getTextLabelSvgElement } from '@app/utils/whiteboard/getTextLabelSvgElement';
import { getFontDefForExport } from '@app/utils/whiteboard/getFontDefForExport';
import { SvgExportContext } from '@app/utils/whiteboard/SvgExportContext';
import { HyperlinkButton } from '@app/utils/whiteboard/HypelinkButton';
import { useEffect, useRef, useState } from 'react';
import { customEllipseProps } from './custom-ellipse-props';
import { CUSTOM_ELLIPSE_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { getQuillForShape, setCurrentQuill } from '@app/utils/whiteboard/quill/utils';
import { CUSTOM_ELLIPSE_SHAPE_DEFAULT_HEIGHT, CUSTOM_ELLIPSE_SHAPE_DEFAULT_WIDTH } from '@app/constants/whiteboard/constants';
import { useTextMesurements } from '../useTextMesurements';
import { DokablyTextColor } from '@app/constants/whiteboard/whiteboard-styles';
import { TextContentForCustomShape } from '../text-content-for-custom-shape/TextContentForCustomShape';
import { showLinkPanelIfNeeded } from '@widgets/whiteboard/text-link/utils';

export class CustomEllipseUtil extends ShapeUtil<ICustomEllipse> {
  static override type = CUSTOM_ELLIPSE_SHAPE_ID;
  static override props = customEllipseProps;
  canEdit = () => true;
  override isAspectRatioLocked = (_shape: ICustomEllipse) => false;
  override canResize = (_shape: ICustomEllipse) => true;
  override canBind = (_shape: ICustomEllipse) => true;

  getGeometry(shape: ICustomEllipse): Geometry2d {
    return new Ellipse2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
  }

  getDefaultProps(): ICustomEllipse['props'] {
    return {
      w: CUSTOM_ELLIPSE_SHAPE_DEFAULT_WIDTH,
      h: CUSTOM_ELLIPSE_SHAPE_DEFAULT_HEIGHT,
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

  getBounds(shape: ICustomEllipse) {
    return new Box(0, 0, shape.props.w, shape.props.h);
  }

  getCenter(shape: ICustomEllipse) {
    return new Vec(shape.props.w / 2, shape.props.h / 2);
  }

  component(shape: ICustomEllipse) {
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

    useTextMesurements({
      shape: CUSTOM_ELLIPSE_SHAPE_ID,
      shapeHeight: bounds.h,
      shapeWidth: bounds.w,
    });

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
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: shape.props.borderColor as string,
              backgroundColor: shape.props.fill as string,
              borderRadius: '50%',
              opacity: 1,
              overflow: 'hidden',
            }}
          >
            <TextContentForCustomShape
              editingShape={editingShapeLocal}
              id={id}
              //@ts-ignore
              type={CUSTOM_ELLIPSE_SHAPE_ID}
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

  indicator(shape: ICustomEllipse) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  // Events
  override onResize: TLOnResizeHandler<ICustomEllipse> = (shape, info) => {
    return resizeBox(shape, info);
  };

  onResizeEnd: TLOnResizeEndHandler<ICustomEllipse> = (shape) => {
    this.editor.setEditingShape(shape.id);
    const quill = getQuillForShape(shape.id);

    if (!quill) return;

    quill.enable();
    quill.focus();
  };

  onEditEnd: TLOnEditEndHandler<ICustomEllipse> = (shape) => {
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
