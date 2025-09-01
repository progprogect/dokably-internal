import {
  Box,
  Circle2d,
  Polygon2d,
  Polyline2d,
  SVGContainer,
  ShapeUtil,
  SvgExportContext,
  TLOnResizeHandler,
  TLShapeUtilCanvasSvgDef,
  VecLike,
  getSvgPathFromPoints,
  rng,
  toFixed,
} from '@tldraw/editor';
import { ICustomPen } from './custom-pen-types';
import { TLDrawShapeSegment, customPenProps } from './custom-pen-props';
import { getStrokePoints } from '@app/utils/whiteboard/getStrokePoints';
import { getFreehandOptions, getPointsFromSegments } from './getPath';
import { last } from 'lodash';
import { useForceSolid } from '@app/utils/whiteboard/useForceSolid';
import { getShapeFillSvg } from '@app/utils/whiteboard/getShapeFillSvg';
import { getFillDefForCanvas } from '@app/utils/whiteboard/getFillDefForCanvas';
import { getStrokeOutlinePoints } from '@app/utils/whiteboard/getStrokeOutlinePoints';
import { setStrokePointRadii } from '@app/utils/whiteboard/setStrokePointRadii';
import { getSvgPathFromStrokePoints } from '@app/utils/whiteboard/getSvgPathFromStrokePoints';
import {
  PEN_DEFAULT_SIZE,
  PEN_HIGHLIGHT_DEFAULT_COLOR,
} from '@app/constants/whiteboard/constants';
import { CUSTOM_DRAW_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';

export class CustomPenUtil extends ShapeUtil<ICustomPen> {
  static override type = CUSTOM_DRAW_SHAPE_ID;
  static override props = customPenProps;

  override hideResizeHandles = (shape: ICustomPen) => getIsDot(shape);
  override hideRotateHandle = (shape: ICustomPen) => getIsDot(shape);
  override hideSelectionBoundsFg = (shape: ICustomPen) => getIsDot(shape);

  override getDefaultProps(): ICustomPen['props'] {
    return {
      segments: [],
      color: PEN_HIGHLIGHT_DEFAULT_COLOR,
      size: PEN_DEFAULT_SIZE,
      isComplete: false,
      isClosed: false,
      isPen: false,
    };
  }

  getGeometry(shape: ICustomPen) {
    //@ts-ignore
    const points = getPointsFromSegments(shape.props.segments);
    const strokeWidth = shape.props.size;

    // A dot
    if (shape.props.segments.length === 1) {
      const box = Box.FromPoints(points);
      //@ts-ignore
      if (box.width < strokeWidth * 2 && box.height < strokeWidth * 2) {
        return new Circle2d({
          //@ts-ignore
          x: -strokeWidth,
          //@ts-ignore
          y: -strokeWidth,
          //@ts-ignore
          radius: strokeWidth,
          isFilled: true,
        });
      }
    }

    const strokePoints = getStrokePoints(
      points,
      //@ts-ignore
      getFreehandOptions(shape.props, strokeWidth, true, true)
    ).map((p) => p.point);

    // A closed draw stroke
    if (shape.props.isClosed) {
      return new Polygon2d({
        points: strokePoints,
        isFilled: false,
      });
    }

    // An open draw stroke
    return new Polyline2d({
      points: strokePoints,
    });
  }

  component(shape: ICustomPen) {
    const forceSolid = useForceSolid();
    const strokeWidth = shape.props.size;
    //@ts-ignore
    const allPointsFromSegments = getPointsFromSegments(shape.props.segments);

    const showAsComplete =
      shape.props.isComplete || last(shape.props.segments)?.type === 'straight';

    let sw = strokeWidth;
    if (
      !forceSolid &&
      !shape.props.isPen &&
      allPointsFromSegments.length === 1
    ) {
      //@ts-ignore
      sw += rng(shape.id)() * (strokeWidth / 6);
    }

    const options = getFreehandOptions(
      shape.props,
      //@ts-ignore
      sw,
      showAsComplete,
      forceSolid
    );
    const strokePoints = getStrokePoints(allPointsFromSegments, options);

    const solidStrokePath =
      strokePoints.length > 1
        ? getSvgPathFromStrokePoints(strokePoints, shape.props.isClosed)
        : //@ts-ignore
          getDot(allPointsFromSegments[0], sw);

    if (!forceSolid || strokePoints.length < 2) {
      setStrokePointRadii(strokePoints, options);
      const strokeOutlinePoints = getStrokeOutlinePoints(strokePoints, options);

      return (
        <SVGContainer id={shape.id}>
          <path
            d={getSvgPathFromPoints(strokeOutlinePoints, true)}
            strokeLinecap='round'
            //@ts-ignore
            fill={shape.props.color}
          />
        </SVGContainer>
      );
    }

    return (
      <SVGContainer id={shape.id}>
        <path
          d={solidStrokePath}
          strokeLinecap='round'
          fill='none'
          //@ts-ignore
          stroke={shape.props.color}
          //@ts-ignore
          strokeWidth={strokeWidth}
          strokeDasharray={'none'}
          strokeDashoffset='0'
        />
      </SVGContainer>
    );
  }

  indicator(shape: ICustomPen) {
    const forceSolid = useForceSolid();
    const strokeWidth = shape.props.size;
    //@ts-ignore
    const allPointsFromSegments = getPointsFromSegments(shape.props.segments);

    let sw = strokeWidth;
    if (
      !forceSolid &&
      !shape.props.isPen &&
      allPointsFromSegments.length === 1
    ) {
      //@ts-ignore
      sw += rng(shape.id)() * (strokeWidth / 6);
    }

    const showAsComplete =
      shape.props.isComplete || last(shape.props.segments)?.type === 'straight';
    //@ts-ignore
    const options = getFreehandOptions(shape.props, sw, showAsComplete, true);
    const strokePoints = getStrokePoints(allPointsFromSegments, options);
    const solidStrokePath =
      strokePoints.length > 1
        ? getSvgPathFromStrokePoints(strokePoints, shape.props.isClosed)
        : //@ts-ignore
          getDot(allPointsFromSegments[0], sw);

    return <path d={solidStrokePath} />;
  }

  // override toSvg(shape: ICustomPen, ctx: SvgExportContext) {
  //   const { color } = shape.props;

  //   const strokeWidth = shape.props.size;
  //   //@ts-ignore
  //   const allPointsFromSegments = getPointsFromSegments(shape.props.segments);

  //   const showAsComplete =
  //     shape.props.isComplete || last(shape.props.segments)?.type === 'straight';

  //   let sw = strokeWidth;
  //   if (!shape.props.isPen && allPointsFromSegments.length === 1) {
  //     //@ts-ignore
  //     sw += rng(shape.id)() * (strokeWidth / 6);
  //   }
  //   //@ts-ignore
  //   const options = getFreehandOptions(shape.props, sw, showAsComplete, false);
  //   const strokePoints = getStrokePoints(allPointsFromSegments, options);
  //   const solidStrokePath =
  //     strokePoints.length > 1
  //       ? getSvgPathFromStrokePoints(strokePoints, shape.props.isClosed)
  //       : //@ts-ignore
  //         getDot(allPointsFromSegments[0], sw);

  //   let foregroundPath: SVGPathElement | undefined;

  //   if (strokePoints.length < 2) {
  //     setStrokePointRadii(strokePoints, options);
  //     const strokeOutlinePoints = getStrokeOutlinePoints(strokePoints, options);

  //     const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  //     p.setAttribute('d', getSvgPathFromPoints(strokeOutlinePoints, true));
  //     //@ts-ignore
  //     p.setAttribute('fill', color);
  //     p.setAttribute('strokeLinecap', 'round');

  //     foregroundPath = p;
  //   } else {
  //     const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  //     p.setAttribute('d', solidStrokePath);
  //     //@ts-ignore
  //     p.setAttribute('stroke', color);
  //     p.setAttribute('fill', 'none');
  //     p.setAttribute('strokeLinecap', 'round');
  //     //@ts-ignore
  //     p.setAttribute('strokeWidth', strokeWidth.toString());
  //     p.setAttribute('stroke-dasharray', 'none');
  //     p.setAttribute('stroke-dashoffset', '0');

  //     foregroundPath = p;
  //   }

  //   const fillPath = getShapeFillSvg({
  //     d: solidStrokePath,
  //     //@ts-ignore
  //     color: shape.props.color,
  //   });

  //   if (fillPath) {
  //     const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  //     g.appendChild(fillPath);
  //     g.appendChild(foregroundPath);
  //     return g;
  //   }

  //   return foregroundPath;
  // }

  override getCanvasSvgDefs(): TLShapeUtilCanvasSvgDef[] {
    return [getFillDefForCanvas()];
  }

  override onResize: TLOnResizeHandler<ICustomPen> = (shape, info) => {
    const { scaleX, scaleY } = info;

    const newSegments: TLDrawShapeSegment[] = [];

    for (const segment of shape.props.segments) {
      newSegments.push({
        ...segment,
        points: segment.points.map(({ x, y, z }) => {
          return {
            x: toFixed(scaleX * x),
            y: toFixed(scaleY * y),
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

  // override expandSelectionOutlinePx(shape: ICustomPen): number {
  //   const multiplier = 1;
  //   return (shape.props.size * multiplier) / 2;
  // }
}

function getDot(point: VecLike, sw: number) {
  const r = (sw + 1) * 0.5;
  return `M ${point.x} ${point.y} m -${r}, 0 a ${r},${r} 0 1,0 ${
    r * 2
  },0 a ${r},${r} 0 1,0 -${r * 2},0`;
}

function getIsDot(shape: ICustomPen) {
  return (
    shape.props.segments.length === 1 &&
    shape.props.segments[0].points.length < 2
  );
}
