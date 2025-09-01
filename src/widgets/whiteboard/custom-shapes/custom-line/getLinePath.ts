import {
  CubicBezier2d,
  CubicSpline2d,
  Edge2d,
  Polyline2d,
  TLHandle,
  TLLineShape,
  Vec,
  VecLike,
  getSvgPathFromPoints,
  precise,
  rng,
  sortByIndex,
  toDomPrecision,
} from '@tldraw/editor';
import { ICustomLine } from './custom-line-types';
import { getSvgPathFromStrokePoints } from '@app/utils/whiteboard/getSvgPathFromStrokePoints';
import { setStrokePointRadii } from '@app/utils/whiteboard/setStrokePointRadii';
import { getStrokePoints } from '@app/utils/whiteboard/getStrokePoints';
import { getStrokeOutlinePoints } from '@app/utils/whiteboard/getStrokeOutlinePoints';

export function getLineDrawFreehandOptions(strokeWidth: number) {
  return {
    size: strokeWidth,
    thinning: 0.4,
    streamline: 0,
    smoothing: 0.5,
    simulatePressure: true,
    last: true,
  };
}

export function getLineSolidFreehandOptions(strokeWidth: number) {
  return {
    size: strokeWidth,
    thinning: 0,
    streamline: 0,
    smoothing: 0.5,
    simulatePressure: false,
    last: true,
  };
}

export function getLineStrokePoints(
  shape: TLLineShape,
  spline: CubicSpline2d | Polyline2d,
  strokeWidth: number
) {
  // const points = getLinePoints(spline)
  const points = spline.vertices;
  const options = getLineDrawFreehandOptions(strokeWidth);
  return getStrokePoints(points, options);
}

export function getLineDrawStrokeOutlinePoints(
  shape: TLLineShape,
  spline: CubicSpline2d | Polyline2d,
  strokeWidth: number
) {
  const options = getLineDrawFreehandOptions(strokeWidth);
  return getStrokeOutlinePoints(
    setStrokePointRadii(
      getLineStrokePoints(shape, spline, strokeWidth),
      options
    ),
    options
  );
}

export function getLineSolidStrokeOutlinePoints(
  shape: TLLineShape,
  spline: CubicSpline2d | Polyline2d,
  strokeWidth: number
) {
  const options = getLineSolidFreehandOptions(strokeWidth);
  return getStrokeOutlinePoints(
    getLineStrokePoints(shape, spline, strokeWidth),
    options
  );
}

export function getLineDrawPath(
  shape: TLLineShape,
  spline: CubicSpline2d | Polyline2d,
  strokeWidth: number
) {
  const stroke = getLineDrawStrokeOutlinePoints(shape, spline, strokeWidth);
  return getSvgPathFromPoints(stroke);
}

export function getLineSolidPath(
  shape: TLLineShape,
  spline: CubicSpline2d | Polyline2d,
  strokeWidth: number
) {
  const outlinePoints = getLineSolidStrokeOutlinePoints(
    shape,
    spline,
    strokeWidth
  );
  return getSvgPathFromPoints(outlinePoints);
}

export function getLineIndicatorPath(
  shape: TLLineShape,
  spline: CubicSpline2d | Polyline2d,
  strokeWidth: number
) {
  if (shape.props.dash === 'draw') {
    const strokePoints = getLineStrokePoints(shape, spline, strokeWidth);
    return getSvgPathFromStrokePoints(strokePoints);
  }

  return getSvgPathForLineGeometry(spline);
}

/** @public */
export function getGeometryForLineShape(
  shape: ICustomLine
): CubicSpline2d | Polyline2d {
  const { spline, points } = shape.props;
  const handlePoints = Object.values(points as Record<string, TLHandle>)
    .sort(sortByIndex)
    .map(Vec.From);

  switch (spline) {
    case 'cubic': {
      return new CubicSpline2d({ points: handlePoints });
    }
    case 'line': {
      return new Polyline2d({ points: handlePoints });
    }
    default: {
      return new Polyline2d({ points: handlePoints });
    }
  }
}

export function getSvgPathForBezierCurve(curve: CubicBezier2d, first: boolean) {
  const { a, b, c, d } = curve;

  if (Vec.Equals(a, d)) return '';

  return `${
    first ? `M${toDomPrecision(a.x)},${toDomPrecision(a.y)}` : ``
  }C${toDomPrecision(b.x)},${toDomPrecision(b.y)} ${toDomPrecision(
    c.x
  )},${toDomPrecision(c.y)} ${toDomPrecision(d.x)},${toDomPrecision(d.y)}`;
}

export function getSvgPathForCubicSpline(
  spline: CubicSpline2d,
  isClosed: boolean
) {
  let d = spline.segments.reduce((d, segment, i) => {
    return d + getSvgPathForBezierCurve(segment, i === 0);
  }, '');

  if (isClosed) {
    d += 'Z';
  }

  return d;
}

export function getSvgPathForEdge(edge: Edge2d, first: boolean) {
  const { start, end } = edge;
  if (first) {
    return `M${toDomPrecision(start.x)},${toDomPrecision(
      start.y
    )} L${toDomPrecision(end.x)},${toDomPrecision(end.y)} `;
  }
  return `${toDomPrecision(end.x)},${toDomPrecision(end.y)} `;
}
export function getSvgPathForLineGeometry(
  spline: CubicSpline2d | Polyline2d,
  isClosed = false
) {
  if (spline instanceof Polyline2d) {
    return getSvgPathForPolylineSpline(spline, isClosed);
  } else {
    return getSvgPathForCubicSpline(spline, isClosed);
  }
}
export function getSvgPathForPolylineSpline(
  spline: Polyline2d,
  isClosed: boolean
) {
  let d = spline.segments.reduce((d, segment, i) => {
    return d + getSvgPathForEdge(segment, i === 0);
  }, '');

  if (isClosed) {
    d += 'Z';
  }

  return d;
}

export function getDrawLinePathData(
  id: string,
  outline: VecLike[],
  strokeWidth: number
) {
  let innerPathData = `M ${precise(outline[0])}L`;
  let outerPathData2 = `M ${precise(outline[0])}L`;

  const offset = strokeWidth / 3;
  const roundness = strokeWidth * 2;

  const random = rng(id);
  let p0 = outline[0];
  let p1: VecLike;

  let s0 = outline[0];
  let s1: VecLike;

  const len = outline.length;

  for (let i = 0, n = len - 1; i < n; i++) {
    p1 = outline[i + 1];
    s1 = Vec.AddXY(outline[i + 1], random() * offset, random() * offset);

    const delta = Vec.Sub(p1, p0);
    const distance = Vec.Len(delta);
    const vector = Vec.Div(delta, distance).mul(
      Math.min(distance / 4, roundness)
    );

    const q0 = Vec.Add(p0, vector);
    const q1 = Vec.Add(p1, vector.neg());

    const sDelta = Vec.Sub(s1, s0);
    const sDistance = Vec.Len(sDelta);
    const sVector = Vec.Div(sDelta, sDistance).mul(
      Math.min(sDistance / 4, roundness)
    );

    const sq0 = Vec.Add(s0, sVector);
    const sq1 = Vec.Add(s1, sVector.neg());

    if (i === n - 1) {
      innerPathData += `${precise(q0)}L ${precise(p1)}`;
      outerPathData2 += `${precise(sq0)}L ${precise(s1)}`;
    } else {
      innerPathData += `${precise(q0)}L ${precise(q1)}Q ${precise(p1)}`;
      outerPathData2 += `${precise(sq0)}L ${precise(sq1)}Q ${precise(s1)}`;

      p0 = p1;
      s0 = s1;
    }
  }

  return [innerPathData, innerPathData + outerPathData2];
}
