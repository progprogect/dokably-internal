import {
  Rectangle2d,
  ShapeUtil,
  TLOnDoubleClickHandler,
  TLOnResizeHandler,
  TLShapeUtilFlag,
  Vec,
  toDomPrecision,
} from '@tldraw/editor';
import { ICustomEmoji } from './custom-emoji-types';
import { customEmojiProps } from './custom-emoji-props';
import { EMOJI_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomEmojiUtil extends ShapeUtil<ICustomEmoji> {
  static override type = EMOJI_SHAPE_ID;
  static override props = customEmojiProps;
  canEdit = () => true;
  override canResize = (_shape: ICustomEmoji) => true;
  override canBind = (_shape: ICustomEmoji) => true;
  override isAspectRatioLocked: TLShapeUtilFlag<ICustomEmoji> = () => true;

  getGeometry(shape: ICustomEmoji) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
      isLabel: false,
    });
  }

  getDefaultProps(): ICustomEmoji['props'] {
    return {
      w: 30,
      h: 30,
      fontSize: 30 * 0.7,
      emoji: localStorage.getItem('emoji') ?? '',
    };
  }

  component(shape: ICustomEmoji) {
    const {
      props: { fontSize, emoji, w, h },
    } = shape;

    return (
      <div
        style={{
          justifyContent: 'middle',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize,
            lineHeight: h + 'px',
            minHeight: fontSize,
            minWidth: w,
            width: w,
            height: h,
          }}
        >
          <div
            dir='ltr'
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {emoji}
          </div>
        </div>
      </div>
    );
  }

  indicator(shape: ICustomEmoji) {
    const bounds = this.editor.getShapeGeometry(shape).bounds;
    return (
      <rect
        width={toDomPrecision(bounds.width)}
        height={toDomPrecision(bounds.height)}
      />
    );
  }

  override onDoubleClick: TLOnDoubleClickHandler<ICustomEmoji> = () => {
    setTimeout(() => {
      this.editor.setEditingShape(null);
    }, 10);
  };

  override onResize: TLOnResizeHandler<ICustomEmoji> = (shape, info) => {
    const { initialBounds, initialShape, scaleX, scaleY } = info;

    const prevWidth = initialBounds.width;
    const prevHeight = initialBounds.height;

    let nextH = prevHeight * scaleY;
    let nextWidth = prevWidth * scaleX;

    const offset = new Vec(0, 0);

    nextWidth = Math.max(1, Math.abs(nextWidth));
    nextH = Math.max(1, Math.abs(nextH));

    const { x, y } = offset.rot(shape.rotation).add(initialShape);

    const equalChange = nextWidth > nextH ? nextWidth : nextH;

    return {
      id: shape.id,
      type: shape.type,
      x,
      y,
      props: {
        ...shape.props,
        w: equalChange,
        h: equalChange,
        fontSize: equalChange * 0.7,
      },
    };
  };
}
