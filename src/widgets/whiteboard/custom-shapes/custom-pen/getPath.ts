import { StrokeOptions } from '@app/utils/whiteboard/getStrokePoints';
import {
  EASINGS,
  PI,
  SIN,
  TLDrawShapeSegment,
  Vec,
} from '@tldraw/editor';
import { ICustomPen } from './custom-pen-types';

const PEN_EASING = (t: number) => t * 0.65 + SIN((t * PI) / 2) * 0.35;

const simulatePressureSettings = (strokeWidth: number): StrokeOptions => {
  return {
    size: 1 + strokeWidth,
    thinning: 0.5,
    streamline: 0.62 + ((1 + strokeWidth) / 8) * 0.06,
    smoothing: 0.62,
    easing: EASINGS.easeOutSine,
    simulatePressure: true,
  };
};

const realPressureSettings = (strokeWidth: number): StrokeOptions => {
  return {
    size: 1 + strokeWidth * 1.2,
    thinning: 0.62,
    streamline: 0.62,
    smoothing: 0.62,
    simulatePressure: false,
    easing: PEN_EASING,
  };
};

const solidSettings = (strokeWidth: number): StrokeOptions => {
  return {
    size: 1 + strokeWidth,
    thinning: 0,
    streamline: 0.62 + ((1 + strokeWidth) / 8) * 0.06,
    smoothing: 0.62,
    simulatePressure: false,
    easing: EASINGS.linear,
  };
};

export function getHighlightFreehandSettings({
  strokeWidth,
  showAsComplete,
}: {
  strokeWidth: number;
  showAsComplete: boolean;
}): StrokeOptions {
  return {
    size: 1 + strokeWidth,
    thinning: 0,
    streamline: 0.5,
    smoothing: 0.5,
    simulatePressure: false,
    easing: EASINGS.easeOutSine,
    last: showAsComplete,
  };
}

export function getFreehandOptions(
  shapeProps: { isPen: boolean; isComplete: boolean },
  strokeWidth: number,
  forceComplete: boolean,
  forceSolid: boolean
): StrokeOptions {
  return {
    ...solidSettings(strokeWidth),
    last: shapeProps.isComplete || forceComplete,
  };
}

export function getPointsFromSegments(segments: TLDrawShapeSegment[]) {
  const points: Vec[] = [];

  for (const segment of segments) {
    if (segment.type === 'free' || segment.points.length < 2) {
      points.push(...segment.points.map(Vec.Cast));
    } else {
      const pointsToInterpolate = Math.max(
        4,
        Math.floor(Vec.Dist(segment.points[0], segment.points[1]) / 16)
      );
      points.push(
        ...Vec.PointsBetween(
          segment.points[0],
          segment.points[1],
          pointsToInterpolate
        )
      );
    }
  }

  return points;
}
