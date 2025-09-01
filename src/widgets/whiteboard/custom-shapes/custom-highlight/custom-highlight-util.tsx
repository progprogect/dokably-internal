import {
  Circle2d,
  Polygon2d,
  SVGContainer,
  ShapeUtil,
  TLOnResizeHandler,
  VecLike,
  rng,
} from '@tldraw/editor';
import { ICustomHighlight } from './custom-highlight-types';
import { customHighlightProps } from './custom-highlight-props';
import { getStrokePoints } from '@app/utils/whiteboard/getStrokePoints';
import { last } from 'lodash';
import { useForceSolid } from '@app/utils/whiteboard/useForceSolid';
import { getStrokeOutlinePoints } from '@app/utils/whiteboard/getStrokeOutlinePoints';
import { setStrokePointRadii } from '@app/utils/whiteboard/setStrokePointRadii';
import { getSvgPathFromStrokePoints } from '@app/utils/whiteboard/getSvgPathFromStrokePoints';
import {
  getHighlightFreehandSettings,
  getPointsFromSegments,
} from '../custom-pen/getPath';
import { TLDrawShapeSegment } from '../custom-pen/custom-pen-props';
import { HIGHLIGHT_DEFAULT_SIZE, PEN_HIGHLIGHT_DEFAULT_COLOR } from '@app/constants/whiteboard/constants';
import { CUSTOM_HIGHLIGHT_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

const OVERLAY_OPACITY = 0.35;
const UNDERLAY_OPACITY = 0.82;

export class CustomHighlightUtil extends ShapeUtil<ICustomHighlight> {
  static override type = CUSTOM_HIGHLIGHT_SHAPE_ID;
  static override props = customHighlightProps;

  override hideResizeHandles = (shape: ICustomHighlight) => getIsDot(shape);
  override hideRotateHandle = (shape: ICustomHighlight) => getIsDot(shape);
  override hideSelectionBoundsFg = (shape: ICustomHighlight) => getIsDot(shape);

  override getDefaultProps(): ICustomHighlight['props'] {
    return {
      segments: [],
      color: PEN_HIGHLIGHT_DEFAULT_COLOR,
      size: HIGHLIGHT_DEFAULT_SIZE,
      isComplete: false,
      isPen: false,
    };
  }

  getGeometry(shape: ICustomHighlight) {
    const strokeWidth = getStrokeWidth(shape);
    if (getIsDot(shape)) {
      return new Circle2d({
        x: -strokeWidth / 2,
        y: -strokeWidth / 2,
        radius: strokeWidth / 2,
        isFilled: true,
      });
    }

    const { strokePoints, sw } = getHighlightStrokePoints(
      shape,
      strokeWidth,
      true
    );
    const opts = getHighlightFreehandSettings({
      strokeWidth: sw,
      showAsComplete: true,
    });
    setStrokePointRadii(strokePoints, opts);

    return new Polygon2d({
      points: getStrokeOutlinePoints(strokePoints, opts),
      isFilled: true,
    });
  }

  component(shape: ICustomHighlight) {
    return (
      <HighlightRenderer
        strokeWidth={getStrokeWidth(shape)}
        shape={shape}
        opacity={OVERLAY_OPACITY}
      />
    );
  }

  //@ts-ignore
  override backgroundComponent(shape: ICustomHighlight) {
    return (
      <HighlightRenderer
        strokeWidth={getStrokeWidth(shape)}
        shape={shape}
        opacity={UNDERLAY_OPACITY}
      />
    );
  }

  indicator(shape: ICustomHighlight) {
    const forceSolid = useForceSolid();
    const strokeWidth = getStrokeWidth(shape);
    //@ts-ignore
    const allPointsFromSegments = getPointsFromSegments(shape.props.segments);

    let sw = strokeWidth;
    if (
      !forceSolid &&
      !shape.props.isPen &&
      allPointsFromSegments.length === 1
    ) {
      sw += rng(shape.id)() * (strokeWidth / 6);
    }

    const showAsComplete =
      shape.props.isComplete || last(shape.props.segments)?.type === 'straight';
    const options = getHighlightFreehandSettings({
      strokeWidth,
      showAsComplete,
    });
    const strokePoints = getStrokePoints(allPointsFromSegments, options);

    let strokePath;
    if (strokePoints.length < 2) {
      strokePath = getIndicatorDot(allPointsFromSegments[0], sw);
    } else {
      strokePath = getSvgPathFromStrokePoints(strokePoints, false);
    }

    return <path d={strokePath} />;
  }

  // override toSvg(shape: ICustomHighlight) {
  //   return highlighterToSvg(getStrokeWidth(shape), shape, OVERLAY_OPACITY);
  // }

  // @ts-ignore
  // override toBackgroundSvg(shape: ICustomHighlight) {
  //   return highlighterToSvg(getStrokeWidth(shape), shape, UNDERLAY_OPACITY);
  // }

  override onResize: TLOnResizeHandler<ICustomHighlight> = (shape, info) => {
    const { scaleX, scaleY } = info;

    const newSegments: TLDrawShapeSegment[] = [];

    for (const segment of shape.props.segments) {
      newSegments.push({
        ...segment,
        points: segment.points.map(({ x, y, z }) => {
          return {
            x: scaleX * x,
            y: scaleY * y,
            z,
          };
        }),
      });
    }

    return {
      props: {
        segments: newSegments,
      },
    };
  };
}

function getShapeDot(point: VecLike) {
  const r = 0.1;
  return `M ${point.x} ${point.y} m -${r}, 0 a ${r},${r} 0 1,0 ${
    r * 2
  },0 a ${r},${r} 0 1,0 -${r * 2},0`;
}

function getIndicatorDot(point: VecLike, sw: number) {
  const r = sw / 2;
  return `M ${point.x} ${point.y} m -${r}, 0 a ${r},${r} 0 1,0 ${
    r * 2
  },0 a ${r},${r} 0 1,0 -${r * 2},0`;
}

function getHighlightStrokePoints(
  shape: ICustomHighlight,
  strokeWidth: number,
  forceSolid: boolean
) {
  //@ts-ignore
  const allPointsFromSegments = getPointsFromSegments(shape.props.segments);
  const showAsComplete =
    shape.props.isComplete || last(shape.props.segments)?.type === 'straight';

  let sw = strokeWidth;
  if (!forceSolid && !shape.props.isPen && allPointsFromSegments.length === 1) {
    sw += rng(shape.id)() * (strokeWidth / 6);
  }

  const options = getHighlightFreehandSettings({
    strokeWidth: sw,
    showAsComplete,
  });
  const strokePoints = getStrokePoints(allPointsFromSegments, options);

  return { strokePoints, sw };
}

function getHighlightSvgPath(
  shape: ICustomHighlight,
  strokeWidth: number,
  forceSolid: boolean
) {
  const { strokePoints, sw } = getHighlightStrokePoints(
    shape,
    strokeWidth,
    forceSolid
  );

  const solidStrokePath =
    strokePoints.length > 1
      ? getSvgPathFromStrokePoints(strokePoints, false)
      : getShapeDot(shape.props.segments[0].points[0]);

  return { solidStrokePath, sw };
}

function HighlightRenderer({
  strokeWidth,
  shape,
  opacity,
}: {
  strokeWidth: number;
  shape: ICustomHighlight;
  opacity?: number;
}) {
  const forceSolid = useForceSolid();
  const { solidStrokePath, sw } = getHighlightSvgPath(
    shape,
    strokeWidth,
    forceSolid
  );
  const color = shape.props.color;

  return (
    <SVGContainer id={shape.id} style={{ opacity }}>
      <path
        d={solidStrokePath}
        strokeLinecap='round'
        fill='none'
        pointerEvents='all'
        //@ts-ignore
        stroke={color}
        strokeWidth={sw}
      />
    </SVGContainer>
  );
}

function highlighterToSvg(
  strokeWidth: number,
  shape: ICustomHighlight,
  opacity: number
) {
  const { solidStrokePath, sw } = getHighlightSvgPath(
    shape,
    strokeWidth,
    false
  );

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', solidStrokePath);
  path.setAttribute('fill', 'none');
  //@ts-ignore
  path.setAttribute('stroke', shape.props.color);
  path.setAttribute('strokeWidth', `${sw}`);
  path.setAttribute('opacity', `${opacity}`);

  return path;
}

function getStrokeWidth(shape: ICustomHighlight) {
  //@ts-ignore
  return shape.props.size * 1.12;
}

function getIsDot(shape: ICustomHighlight) {
  return (
    shape.props.segments.length === 1 &&
    shape.props.segments[0].points.length < 2
  );
}
