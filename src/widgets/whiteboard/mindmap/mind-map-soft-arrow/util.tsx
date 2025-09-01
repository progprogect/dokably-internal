import {
  Box,
  Edge2d,
  Editor,
  Group2d,
  Mat,
  MatModel,
  SVGContainer,
  ShapeUtil,
  TLArrowInfo,
  TLArrowShape,
  TLArrowShapeArrowheadStyle,
  TLArrowShapeTerminal,
  TLHandle,
  TLOnClickHandler,
  TLOnHandleDragHandler,
  TLOnResizeHandler,
  TLOnTranslateStartHandler,
  TLShapeId,
  TLShapeUtilFlag,
  Vec,
  VecLike,
  toDomPrecision,
} from '@tldraw/tldraw';
import { IMindMapSoftArrow } from './types';
import { useEffect, useMemo } from 'react';
import { mindMapSoftArrowProps } from './props';
import { getPerfectDashProps } from './getPerfectDashProps';
import {
  DocablyMindMapLineColor,
  DokablyEndAnchorPosition,
  DokablyStartAnchorPosition,
} from '@app/constants/whiteboard/whiteboard-styles';
import { MIND_MAP_SOFT_ARROW_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { ARROW_DEFAULT_SIZE } from '@app/constants/whiteboard/constants';
import { getCurvedArrowHandlePath, getStraightArrowHandlePath } from '@widgets/whiteboard/utils';
import { BoundShapeInfo } from '@widgets/whiteboard/arrows-common-utils';

let globalRenderIndex = 0;

export class MindMapSoftArrowUtil extends ShapeUtil<IMindMapSoftArrow> {
  static override type = MIND_MAP_SOFT_ARROW_SHAPE_ID;
  static override props = mindMapSoftArrowProps;

  override isAspectRatioLocked = (_shape: IMindMapSoftArrow) => true;
  override canResize = (_shape: IMindMapSoftArrow) => false;

  override canCrop = () => false;
  override canEdit = () => false;
  override canBind = () => false;
  override canSnap = () => false;
  override hideResizeHandles: TLShapeUtilFlag<IMindMapSoftArrow> = () => true;
  override hideRotateHandle: TLShapeUtilFlag<IMindMapSoftArrow> = () => true;
  override hideSelectionBoundsBg: TLShapeUtilFlag<IMindMapSoftArrow> = () => true;
  override hideSelectionBoundsFg: TLShapeUtilFlag<IMindMapSoftArrow> = () => true;

  override getDefaultProps(): IMindMapSoftArrow['props'] {
    return {
      color: DocablyMindMapLineColor.defaultValue,
      dash: 'draw',
      size: ARROW_DEFAULT_SIZE,
      arrowheadStart: 'none',
      arrowheadEnd: 'arrow' as const,
      start: { type: 'point', x: 0, y: 0 },
      end: { type: 'point', x: 2, y: 0 },
      bend: 0,
      startingAnchorOrientation: DokablyStartAnchorPosition.defaultValue,
      endingAnchorOrientation: DokablyEndAnchorPosition.defaultValue,
    };
  }

  onHandleDrag: TLOnHandleDragHandler<IMindMapSoftArrow> = () => {
  };

  override onTranslateStart: TLOnTranslateStartHandler<IMindMapSoftArrow> = () => {
  };

  getGeometry(shape: IMindMapSoftArrow) {
    const info = getStraightArrowInfo(this.editor, shape);

    const bodyGeom = new Edge2d({
      start: Vec.From(info.start.point),
      end: Vec.From(info.end.point),
    });

    const geometry = new Group2d({
      children: [bodyGeom],
    });

    return geometry;
  }

  component(shape: IMindMapSoftArrow) {
    useEffect(() => {
      this.editor.updateShape({ ...shape, isLocked: true })
    }, [])

    const onlySelectedShape = this.editor.getOnlySelectedShape();
    const shouldDisplayHandles =
      this.editor.isInAny(
        'select.idle',
        'select.pointing_handle',
        'select.dragging_handle',
        'arrow.dragging'
      ) && !this.editor.getInstanceState().isReadonly;

    const info = getStraightArrowInfo(this.editor, shape);
    const bounds = Box.ZeroFix(this.editor.getShapeGeometry(shape).bounds);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const changeIndex = useMemo<number>(() => {
      return this.editor.environment.isSafari ? (globalRenderIndex += 1) : 0;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shape]);

    if (!info?.isValid) return null;

    const strokeWidth = 1;

    const as =
      info.start.arrowhead &&
      getArrowheadPathForType(info, 'start', strokeWidth);

    const ae =
      info.end.arrowhead && getArrowheadPathForType(info, 'end', strokeWidth);

    const { xPoint: xStart, yPoint: yStart } =
      computeArrowPointAccordingToArrowHead(
        info.start.point.x,
        info.start.point.y,
        0,
        strokeWidth,
        shape.props.startingAnchorOrientation as AnchorPositionType
      );

    // Ending point with arrow
    const { xPoint: xEnd, yPoint: yEnd } =
      computeArrowPointAccordingToArrowHead(
        info.end.point.x,
        info.end.point.y,
        4,
        strokeWidth,
        shape.props.endingAnchorOrientation as AnchorPositionType
      );

    // Starting position
    const { xAnchor1, yAnchor1 } = computeStartingAnchorPosition(
      xStart,
      yStart,
      xEnd,
      yEnd,
      shape.props.startingAnchorOrientation as AnchorPositionType
    );

    // Ending position
    const { xAnchor2, yAnchor2 } = computeEndingAnchorPosition(
      xStart,
      yStart,
      xEnd,
      yEnd,
      shape.props.endingAnchorOrientation as AnchorPositionType
    );

    const pathString = computePathString({
      xStart,
      yStart,
      xAnchor1,
      yAnchor1,
      xAnchor2,
      yAnchor2,
      xEnd,
      yEnd,
    });

    let handlePath: null | JSX.Element = null;

    if (onlySelectedShape === shape && shouldDisplayHandles) {

      const sw = 1;
      const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(
        info.isStraight
          ? Vec.Dist(info.start.handle, info.end.handle)
          : Math.abs(info.handleArc.length),
        sw,
        {
          end: 'skip',
          start: 'skip',
          lengthRatio: 2.5,
        }
      );

      handlePath =
        shape.props.start.type === 'binding' ||
        shape.props.end.type === 'binding' ? (
          <path
            className='tl-arrow-hint'
            d={
              info.isStraight
                ? getStraightArrowHandlePath(info)
                : getCurvedArrowHandlePath(info)
            }
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeWidth={sw}
            markerStart={
              shape.props.start.type === 'binding'
                ? shape.props.start.isExact
                  ? ''
                  : 'url(#arrowhead-dot)'
                : ''
            }
            markerEnd={
              shape.props.end.type === 'binding'
                ? shape.props.end.isExact
                  ? ''
                  : 'url(#arrowhead-dot)'
                : ''
            }
            opacity={0.16}
          />
        ) : null;
    }

    const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(
      info.isStraight ? info.length : Math.abs(info.bodyArc.length),
      strokeWidth,
      {
        style: shape.props.dash,
      }
    );

    const maskStartArrowhead = !(
      info.start.arrowhead === 'none' || info.start.arrowhead === 'arrow'
    );
    const maskEndArrowhead = !(
      info.end.arrowhead === 'none' || info.end.arrowhead === 'arrow'
    );

    // NOTE: I know right setting `changeIndex` hacky-as right! But we need this because otherwise safari loses
    // the mask, see <https://linear.app/tldraw/issue/TLD-1500/changing-arrow-color-makes-line-pass-through-text>
    const maskId = (shape.id + '_clip_' + changeIndex).replace(':', '_');

    return (
      <>
        <SVGContainer id={shape.id} style={{ minWidth: 50, minHeight: 50 }}>
          <defs>
            <mask id={maskId}>
              <rect
                x={toDomPrecision(-100 + bounds.minX)}
                y={toDomPrecision(-100 + bounds.minY)}
                width={toDomPrecision(bounds.width + 200)}
                height={toDomPrecision(bounds.height + 200)}
                fill='white'
              />
              {as && maskStartArrowhead && (
                <path
                  d={as}
                  fill={info.start.arrowhead === 'arrow' ? 'none' : 'black'}
                  stroke='none'
                />
              )}
              {ae && maskEndArrowhead && (
                <path
                  d={ae}
                  fill={info.end.arrowhead === 'arrow' ? 'none' : 'black'}
                  stroke='none'
                />
              )}
            </mask>
          </defs>
          <g
            fill='none'
            stroke={shape.props.color as string}
            strokeWidth={strokeWidth}
            strokeLinejoin='round'
            strokeLinecap='round'
            pointerEvents='none'
          >
            {handlePath}
            {/* firefox will clip if you provide a maskURL even if there is no mask matching that URL in the DOM */}
            <g mask={`url(#${maskId})`}>
              <rect
                x={toDomPrecision(bounds.minX - 100)}
                y={toDomPrecision(bounds.minY - 100)}
                width={toDomPrecision(bounds.width + 200)}
                height={toDomPrecision(bounds.height + 200)}
                opacity={0}
              />
              <path
                d={pathString}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            </g>
            {/* {as && maskStartArrowhead && shape.props.fill !== 'none' && (
						<ShapeFill theme={theme} d={as} color={shape.props.color} fill={shape.props.fill} />
					)}
					{ae && maskEndArrowhead && shape.props.fill !== 'none' && (
						<ShapeFill theme={theme} d={ae} color={shape.props.color} fill={shape.props.fill} />
					)} */}
            {as && <path d={as} />}
            {ae && <path d={ae} />}
          </g>
        </SVGContainer>
      </>
    );
  }

  indicator() {
    return;
  }

  override onClick?: TLOnClickHandler<IMindMapSoftArrow> | undefined = () => {
  };

  override onResize: TLOnResizeHandler<IMindMapSoftArrow> = () => {
  };

  override getHandles(shape: IMindMapSoftArrow): TLHandle[] {
    return [];
  }
}

function computePathString({
  xStart,
  yStart,
  xAnchor1,
  yAnchor1,
  xAnchor2,
  yAnchor2,
  xEnd,
  yEnd,
}: {
  xStart: number;
  yStart: number;
  xAnchor1: number;
  yAnchor1: number;
  xAnchor2: number;
  yAnchor2: number;
  xEnd: number;
  yEnd: number;
}): string {
  let linePath = `M${xStart},${yStart} `;

  linePath += `C${xAnchor1},${yAnchor1} ${xAnchor2},${yAnchor2} `;

  linePath += `${xEnd},${yEnd}`;
  return linePath;
}

export type AnchorPositionType = 'top' | 'bottom' | 'left' | 'right' | 'middle';

export function computeEndingAnchorPosition(
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number,
  endingAnchorOrientation: AnchorPositionType
): {
  xAnchor2: number;
  yAnchor2: number;
} {
  if (
    endingAnchorOrientation === 'top' ||
    endingAnchorOrientation === 'bottom'
  ) {
    return {
      xAnchor2: xEnd,
      yAnchor2: yEnd - (yEnd - yStart) / 2,
    };
  }

  if (
    endingAnchorOrientation === 'left' ||
    endingAnchorOrientation === 'right'
  ) {
    return {
      xAnchor2: xEnd - (xEnd - xStart) / 2,
      yAnchor2: yEnd,
    };
  }

  return {
    xAnchor2: xEnd,
    yAnchor2: yEnd,
  };
}

export function computeStartingAnchorPosition(
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number,
  startingAnchorOrientation: AnchorPositionType
): {
  xAnchor1: number;
  yAnchor1: number;
} {
  if (
    startingAnchorOrientation === 'top' ||
    startingAnchorOrientation === 'bottom'
  ) {
    return {
      xAnchor1: xStart,
      yAnchor1: yStart + (yEnd - yStart) / 2,
    };
  }

  if (
    startingAnchorOrientation === 'left' ||
    startingAnchorOrientation === 'right'
  ) {
    return {
      xAnchor1: xStart + (xEnd - xStart) / 2,
      yAnchor1: yStart,
    };
  }

  return {
    xAnchor1: xStart,
    yAnchor1: yStart,
  };
}

export function computeArrowPointAccordingToArrowHead(
  xArrowHeadPoint: number,
  yArrowHeadPoint: number,
  arrowLength: number,
  strokeWidth: number,
  endingAnchorOrientation: AnchorPositionType
) {
  let { arrowX, arrowY } = computeArrowDirectionVector(endingAnchorOrientation);

  const xPoint = xArrowHeadPoint + (arrowX * arrowLength * strokeWidth) / 2;
  const yPoint = yArrowHeadPoint + (arrowY * arrowLength * strokeWidth) / 2;
  return {
    xPoint,
    yPoint,
  };
}

export function computeArrowDirectionVector(
  anchorOrientation: AnchorPositionType
) {
  switch (anchorOrientation) {
    case 'left':
      return {
        arrowX: -1,
        arrowY: 0,
      };

    case 'right':
      return {
        arrowX: 1,
        arrowY: 0,
      };

    case 'top':
      return {
        arrowX: 0,
        arrowY: -1,
      };

    case 'bottom':
      return {
        arrowX: 0,
        arrowY: 1,
      };

    default:
      return {
        arrowX: 0,
        arrowY: 0,
      };
  }
}

function getArrowheadPathForType(
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

type TLArrowPointsInfo = {
  point: VecLike;
  int: VecLike;
};

function getArrowPoints(
  info: TLArrowInfo,
  side: 'start' | 'end',
  strokeWidth: number
): TLArrowPointsInfo {
  const arrowDirection =
    info.end.point.x > info.start.point.x ? 'right' : 'left';

  const initialPT = side === 'end' ? info.end.point : info.start.point;
  const PT =
    arrowDirection === 'right'
      ? { ...initialPT, x: initialPT.x + strokeWidth * 2 }
      : { ...initialPT, x: initialPT.x - strokeWidth * 2 };
  const PB = side === 'end' ? info.start.point : info.end.point;

  const compareLength = info.isStraight
    ? Vec.Dist(PB, PT)
    : Math.abs(info.bodyArc.length); // todo: arc length for curved arrows

  const length = Math.max(
    Math.min(compareLength / 5, strokeWidth * 3),
    strokeWidth
  );

  const P0 = new Vec(
    arrowDirection === 'right' ? PT.x - strokeWidth * 2 : PT.x + strokeWidth * 2,
    PT.y
  );

  return {
    point: PT,
    int: P0,
  };
}
export const PI = Math.PI;

export function getArrowhead({ point, int }: TLArrowPointsInfo) {
  const PL = Vec.RotWith(int, point, PI / 6);
  const PR = Vec.RotWith(int, point, -PI / 6);

  return `M ${PL.x} ${PL.y} L ${point.x} ${point.y} L ${PR.x} ${PR.y}`;
}

export const MIN_ARROW_LENGTH = 10
export const BOUND_ARROW_OFFSET = 10

export function getBoundShapeRelationships(
	editor: Editor,
	startShapeId?: TLShapeId,
	endShapeId?: TLShapeId
) {
	if (!startShapeId || !endShapeId) return 'safe'
	if (startShapeId === endShapeId) return 'double-bound'
	const startBounds = editor.getShapePageBounds(startShapeId)
	const endBounds = editor.getShapePageBounds(endShapeId)
	if (startBounds && endBounds) {
		if (startBounds.contains(endBounds)) return 'start-contains-end'
		if (endBounds.contains(startBounds)) return 'end-contains-start'
	}
	return 'safe'
}

export function getArrowTerminalInArrowSpace(
	editor: Editor,
	arrowPageTransform: Mat,
	terminal: TLArrowShapeTerminal,
	forceImprecise: boolean
) {
	if (terminal.type === 'point') {
		return Vec.From(terminal)
	}

	const boundShape = editor.getShape(terminal.boundShapeId)

	if (!boundShape) {
		// this can happen in multiplayer contexts where the shape is being deleted
		return new Vec(0, 0)
	} else {
		// Find the actual local point of the normalized terminal on
		// the bound shape and transform it to page space, then transform
		// it to arrow space
		const { point, size } = editor.getShapeGeometry(boundShape).bounds
		const shapePoint = Vec.Add(
			point,
			Vec.MulV(
				// if the parent is the bound shape, then it's ALWAYS precise
				terminal.isPrecise || forceImprecise ? terminal.normalizedAnchor : { x: 0.5, y: 0.5 },
				size
			)
		)
		const pagePoint = Mat.applyToPoint(editor.getShapePageTransform(boundShape)!, shapePoint)
		const arrowPoint = Mat.applyToPoint(Mat.Inverse(arrowPageTransform), pagePoint)
		return arrowPoint
	}
}

export function getArrowTerminalsInArrowSpace(editor: Editor, shape: TLArrowShape) {
	const arrowPageTransform = editor.getShapePageTransform(shape)!

	let startBoundShapeId: TLShapeId | undefined
	let endBoundShapeId: TLShapeId | undefined

	if (shape.props.start.type === 'binding' && shape.props.end.type === 'binding') {
		startBoundShapeId = shape.props.start.boundShapeId
		endBoundShapeId = shape.props.end.boundShapeId
	}

	const boundShapeRelationships = getBoundShapeRelationships(
		editor,
		startBoundShapeId,
		endBoundShapeId
	)

	const start = getArrowTerminalInArrowSpace(
		editor,
		arrowPageTransform,
		shape.props.start,
		boundShapeRelationships === 'double-bound' || boundShapeRelationships === 'start-contains-end'
	)

	const end = getArrowTerminalInArrowSpace(
		editor,
		arrowPageTransform,
		shape.props.end,
		boundShapeRelationships === 'double-bound' || boundShapeRelationships === 'end-contains-start'
	)

	return { start, end }
}

export const STROKE_SIZES: Record<string, number> = {
	s: 2,
	m: 3.5,
	l: 5,
	xl: 10,
}


export function getStraightArrowInfo(editor: Editor, shape: IMindMapSoftArrow): TLArrowInfo {
	const { start, end, arrowheadStart, arrowheadEnd } = shape.props

	const terminalsInArrowSpace = getArrowTerminalsInArrowSpace(editor, shape as unknown as TLArrowShape)

	const a = terminalsInArrowSpace.start.clone()
	const b = terminalsInArrowSpace.end.clone()
	const c = Vec.Med(a, b)

	if (Vec.Equals(a, b)) {
		return {
			isStraight: true,
			start: {
				handle: a,
				point: a,
				arrowhead: shape.props.arrowheadStart as TLArrowShapeArrowheadStyle,
			},
			end: {
				handle: b,
				point: b,
				arrowhead: shape.props.arrowheadEnd as TLArrowShapeArrowheadStyle,
			},
			middle: c,
			isValid: false,
			length: 0,
		}
	}

	const uAB = Vec.Sub(b, a).uni()

	// Update the arrowhead points using intersections with the bound shapes, if any.
	const startShapeInfo = getBoundShapeInfoForTerminal(editor, start)
	const endShapeInfo = getBoundShapeInfoForTerminal(editor, end)

	const arrowPageTransform = editor.getShapePageTransform(shape)!

	// Update the position of the arrowhead's end point
	updateArrowheadPointWithBoundShape(
		b, // <-- will be mutated
		terminalsInArrowSpace.start,
		arrowPageTransform,
		endShapeInfo
	)

	// Then update the position of the arrowhead's end point
	updateArrowheadPointWithBoundShape(
		a, // <-- will be mutated
		terminalsInArrowSpace.end,
		arrowPageTransform,
		startShapeInfo
	)

	let offsetA = 0
	let offsetB = 0
	let strokeOffsetA = 0
	let strokeOffsetB = 0
	let minLength = MIN_ARROW_LENGTH

	const isSelfIntersection =
		startShapeInfo && endShapeInfo && startShapeInfo.shape === endShapeInfo.shape

	const relationship =
		startShapeInfo && endShapeInfo
			? getBoundShapeRelationships(editor, startShapeInfo.shape.id, endShapeInfo?.shape?.id)
			: 'safe'

	if (
		relationship === 'safe' &&
		startShapeInfo &&
		endShapeInfo &&
		!isSelfIntersection &&
		!startShapeInfo.isExact &&
		!endShapeInfo.isExact
	) {
		if (endShapeInfo.didIntersect && !startShapeInfo.didIntersect) {
			// ...and if only the end shape intersected, then make it
			// a short arrow ending at the end shape intersection.

			if (startShapeInfo.isClosed) {
				a.setTo(b.clone().add(uAB.clone().mul(MIN_ARROW_LENGTH)))
			}
		} else if (!endShapeInfo.didIntersect) {
			// ...and if only the end shape intersected, or if neither
			// shape intersected, then make it a short arrow starting
			// at the start shape intersection.
			if (endShapeInfo.isClosed) {
				b.setTo(a.clone().sub(uAB.clone().mul(MIN_ARROW_LENGTH)))
			}
		}
	}

	const u = Vec.Sub(b, a).uni()
	const didFlip = !Vec.Equals(u, uAB)

	// If the arrow is bound non-exact to a start shape and the
	// start point has an arrowhead, then offset the start point
	if (!isSelfIntersection) {
		if (
			relationship !== 'start-contains-end' &&
			startShapeInfo &&
			arrowheadStart !== 'none' &&
			!startShapeInfo.isExact
		) {
      const startShape = startShapeInfo.shape as IMindMapSoftArrow

			strokeOffsetA =
        shape.props.size / 2 +
				('size' in startShapeInfo.shape.props
					? STROKE_SIZES[startShapeInfo.shape.props.size] / 2
					: 0)
			offsetA = BOUND_ARROW_OFFSET + strokeOffsetA
			minLength += strokeOffsetA
		}

		// If the arrow is bound non-exact to an end shape and the
		// end point has an arrowhead offset the end point
		if (
			relationship !== 'end-contains-start' &&
			endShapeInfo &&
			arrowheadEnd !== 'none' &&
			!endShapeInfo.isExact
		) {
      const endShape = endShapeInfo.shape as IMindMapSoftArrow

			strokeOffsetB =
        shape.props.size / 2 +
				('size' in endShapeInfo.shape.props ? STROKE_SIZES[endShape.props.size] / 2 : 0)

			offsetB = BOUND_ARROW_OFFSET + strokeOffsetB
			minLength += strokeOffsetB
		}
	}

	// Adjust offsets if the length of the arrow is too small

	const tA = a.clone().add(u.clone().mul(offsetA * (didFlip ? -1 : 1)))
	const tB = b.clone().sub(u.clone().mul(offsetB * (didFlip ? -1 : 1)))
	const distAB = Vec.Dist(tA, tB)

	if (distAB < minLength) {
		if (offsetA !== 0 && offsetB !== 0) {
			// both bound + offset
			offsetA *= -1.5
			offsetB *= -1.5
		} else if (offsetA !== 0) {
			// start bound + offset
			offsetA *= -1
		} else if (offsetB !== 0) {
			// end bound + offset
			offsetB *= -1
		} else {
			// noop, its just a really short arrow
		}
	}

	a.add(u.clone().mul(offsetA * (didFlip ? -1 : 1)))
	b.sub(u.clone().mul(offsetB * (didFlip ? -1 : 1)))

	// If the handles flipped their order, then set the center handle
	// to the midpoint of the terminals (rather than the midpoint of the
	// arrow body); otherwise, it may not be "between" the other terminals.
	if (didFlip) {
		if (startShapeInfo && endShapeInfo) {
			// If we have two bound shapes...then make the arrow a short arrow from
			// the start point towards where the end point should be.
			b.setTo(Vec.Add(a, u.clone().mul(-MIN_ARROW_LENGTH)))
		}
		c.setTo(Vec.Med(terminalsInArrowSpace.start, terminalsInArrowSpace.end))
	} else {
		c.setTo(Vec.Med(a, b))
	}

	const length = Vec.Dist(a, b)

  const result = {
		isStraight: true as const,
		start: {
			handle: terminalsInArrowSpace.start,
			point: a,
			arrowhead: shape.props.arrowheadStart as TLArrowShapeArrowheadStyle,
		},
		end: {
			handle: terminalsInArrowSpace.end,
			point: b,
			arrowhead: shape.props.arrowheadEnd as TLArrowShapeArrowheadStyle,
		},
		middle: c,
		isValid: length > 0,
		length,
	};

	return result
}

export function getBoundShapeInfoForTerminal(
	editor: Editor,
	terminal: TLArrowShapeTerminal
): BoundShapeInfo | undefined {
	if (terminal.type === 'point') {
		return
	}

	const shape = editor.getShape(terminal.boundShapeId)!

  if (!shape) return;

	const transform = editor.getShapePageTransform(shape)!
	const geometry = editor.getShapeGeometry(shape)

	// This is hacky: we're only looking at the first child in the group. Really the arrow should
	// consider all items in the group which are marked as snappable as separate polygons with which
	// to intersect, in the case of a group that has multiple children which do not overlap; or else
	// flatten the geometry into a set of polygons and intersect with that.
	const outline = geometry instanceof Group2d ? geometry.children[0].vertices : geometry.vertices

	return {
		shape,
		transform,
		isClosed: geometry.isClosed,
		isExact: terminal.isExact,
		didIntersect: false,
		outline,
	}
}

export function intersectLineSegmentLineSegment(
	a1: VecLike,
	a2: VecLike,
	b1: VecLike,
	b2: VecLike
) {
	const ABx = a1.x - b1.x
	const ABy = a1.y - b1.y
	const BVx = b2.x - b1.x
	const BVy = b2.y - b1.y
	const AVx = a2.x - a1.x
	const AVy = a2.y - a1.y
	const ua_t = BVx * ABy - BVy * ABx
	const ub_t = AVx * ABy - AVy * ABx
	const u_b = BVy * AVx - BVx * AVy

	if (ua_t === 0 || ub_t === 0) return null // coincident

	if (u_b === 0) return null // parallel

	if (u_b !== 0) {
		const ua = ua_t / u_b
		const ub = ub_t / u_b
		if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
			return Vec.AddXY(a1, ua * AVx, ua * AVy)
		}
	}

	return null // no intersection
}

export function intersectLineSegmentPolygon(a1: VecLike, a2: VecLike, points: VecLike[]) {
	const result: VecLike[] = []
	let segmentIntersection: VecLike | null

	for (let i = 1, n = points.length; i < n + 1; i++) {
		segmentIntersection = intersectLineSegmentLineSegment(
			a1,
			a2,
			points[i - 1],
			points[i % points.length]
		)
		if (segmentIntersection) result.push(segmentIntersection)
	}

	if (result.length === 0) return null // no intersection

	return result
}

export function intersectLineSegmentPolyline(a1: VecLike, a2: VecLike, points: VecLike[]) {
	const result: VecLike[] = []
	let segmentIntersection: VecLike | null

	for (let i = 0, n = points.length - 1; i < n; i++) {
		segmentIntersection = intersectLineSegmentLineSegment(a1, a2, points[i], points[i + 1])
		if (segmentIntersection) result.push(segmentIntersection)
	}

	if (result.length === 0) return null // no intersection

	return result
}

function updateArrowheadPointWithBoundShape(
	point: Vec,
	opposite: Vec,
	arrowPageTransform: MatModel,
	targetShapeInfo?: BoundShapeInfo
) {
	if (targetShapeInfo === undefined) {
		// No bound shape? The arrowhead point will be at the arrow terminal.
		return
	}

	if (targetShapeInfo.isExact) {
		// Exact type binding? The arrowhead point will be at the arrow terminal.
		return
	}

	// From and To in page space
	const pageFrom = Mat.applyToPoint(arrowPageTransform, opposite)
	const pageTo = Mat.applyToPoint(arrowPageTransform, point)

	// From and To in local space of the target shape
	const targetFrom = Mat.applyToPoint(Mat.Inverse(targetShapeInfo.transform), pageFrom)
	const targetTo = Mat.applyToPoint(Mat.Inverse(targetShapeInfo.transform), pageTo)

	const isClosed = targetShapeInfo.isClosed
	const fn = isClosed ? intersectLineSegmentPolygon : intersectLineSegmentPolyline

	const intersection = fn(targetFrom, targetTo, targetShapeInfo.outline)

	let targetInt: VecLike | undefined

	if (intersection !== null) {
		targetInt =
			intersection.sort((p1, p2) => Vec.Dist(p1, targetFrom) - Vec.Dist(p2, targetFrom))[0] ??
			(isClosed ? undefined : targetTo)
	}

	if (targetInt === undefined) {
		// No intersection? The arrowhead point will be at the arrow terminal.
		return
	}

	const pageInt = Mat.applyToPoint(targetShapeInfo.transform, targetInt)
	const arrowInt = Mat.applyToPoint(Mat.Inverse(arrowPageTransform), pageInt)

	point.setTo(arrowInt)

	targetShapeInfo.didIntersect = true
}