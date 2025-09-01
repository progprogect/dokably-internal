import { Mat, PI, TLArrowInfo, TLShape, Vec, VecLike } from "@tldraw/editor"

export type BoundShapeInfo<T extends TLShape = TLShape> = {
	shape: T
	didIntersect: boolean
	isExact: boolean
	isClosed: boolean
	transform: Mat
	outline: Vec[]
}


export function objectMapEntries<Key extends string, Value>(object: {
	[K in Key]: Value
}): Array<[Key, Value]> {
	return Object.entries(object) as [Key, Value][]
}

export function mapObjectMapValues<Key extends string, ValueBefore, ValueAfter>(
	object: { readonly [K in Key]: ValueBefore },
	mapper: (key: Key, value: ValueBefore) => ValueAfter
): { [K in Key]: ValueAfter } {
	const result = {} as { [K in Key]: ValueAfter }
	for (const [key, value] of objectMapEntries(object)) {
		const newValue = mapper(key, value)
		result[key] = newValue
	}
	return result
}

export const calculateAnchorOrientation = (startPoint: VecLike, endPoint: VecLike) => {
  const xDifference = startPoint.x - endPoint.x;
  const yDifference = startPoint.y - endPoint.y;
  
  const xDifferenceModule = Math.abs(xDifference);
  const yDifferenceModule = Math.abs(yDifference);

  switch (true) {
    case xDifferenceModule >= yDifferenceModule && endPoint.x <= 0:
      return 'left';
    case xDifferenceModule >= yDifferenceModule && endPoint.x > 0:
      return 'right';
    case xDifferenceModule < yDifferenceModule && endPoint.y <= 0:
      return 'top';
    case xDifferenceModule < yDifferenceModule && endPoint.y > 0:
      return 'bottom';
    default:
      return 'middle';
  }
};

export type TLArrowPointsInfo = {
  point: VecLike;
  int: VecLike;
};

export function getArrowPoints(
  info: TLArrowInfo,
  side: 'start' | 'end',
  strokeWidth: number
): TLArrowPointsInfo {
  const arrowDirection = calculateAnchorOrientation(info.start.point, info.end.point)
  const initialPT = side === 'end' ? JSON.parse(JSON.stringify(info.end.point)) : JSON.parse(JSON.stringify(info.start.point));

  let PT = JSON.parse(JSON.stringify(initialPT));

  switch (true) {
    case arrowDirection === 'right':
      PT = { ...initialPT, x: initialPT.x + strokeWidth * 2 };
      break;
    case arrowDirection === 'left':
      PT = { ...initialPT, x: initialPT.x - strokeWidth * 2 };
      break;
    case arrowDirection === 'top':
      PT = { ...initialPT, y: initialPT.y - strokeWidth * 2};
      break;
    case arrowDirection === 'bottom':
      PT = { ...initialPT, y: initialPT.y + strokeWidth * 2};
      break;
    default:
      break;
  }

  let P0;

  switch (true) {
    case arrowDirection === 'right':
      P0 = new Vec(
        PT.x - strokeWidth * 2,
        PT.y
      );
      break;
    case arrowDirection === 'left':
      P0 = new Vec(
        PT.x + strokeWidth * 2,
        PT.y
      );
      break;
    case arrowDirection === 'top':
      P0 = new Vec(
        PT.x,
        PT.y + strokeWidth * 2,
      );
      break;
    case arrowDirection === 'bottom':
      P0 = new Vec(
        PT.x,
        PT.y - strokeWidth * 2,
      );
      break;
    default:
      P0 = new Vec(
        PT.x,
        PT.y
      );
      break;
  }

  return {
    point: PT,
    int: P0,
  };
}

export function getArrowhead({ point, int }: TLArrowPointsInfo) {
  const PL = Vec.RotWith(int, point, PI / 6);
  const PR = Vec.RotWith(int, point, -PI / 6);

  return `M ${PL.x} ${PL.y} L ${point.x} ${point.y} L ${PR.x} ${PR.y}`;
}

export function getArrowheadPathForType(
  info: TLArrowInfo,
  side: 'start' | 'end',
  strokeWidth: number
): string | undefined {
  const type = side === 'end' ? info.end.arrowhead : info.start.arrowhead;
  if (type === 'none') return;

  const points = getArrowPoints(info, side, strokeWidth);
  if (!points) return;

  return getArrowhead(points);
}
