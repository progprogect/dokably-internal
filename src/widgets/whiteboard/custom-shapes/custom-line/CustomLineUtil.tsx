/* eslint-disable react-hooks/rules-of-hooks */
import {
  Group2d,
  HandleSnapGeometry,
  SVGContainer,
  ShapeUtil,
  TLHandle,
  TLLineShape,
  TLOnHandleDragHandler,
  TLOnResizeHandler,
  Vec,
  WeakMapCache,
  getIndexBetween,
  getIndices,
  sortByIndex,
} from '@tldraw/editor';
import { getPerfectDashProps } from './getPerfectDashProps';
import {
  getDrawLinePathData,
  getGeometryForLineShape,
  getLineDrawPath,
  getLineIndicatorPath,
  getSvgPathForBezierCurve,
  getSvgPathForEdge,
  getSvgPathForLineGeometry,
} from './getLinePath';
import { CUSTOM_LINE_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { ICustomLine } from './custom-line-types';
import { DocablyArrowColor } from '@app/constants/whiteboard/whiteboard-styles';
import { customLineShapeProps } from './custom-line-props';
import { ARROW_DEFAULT_SIZE } from '@app/constants/whiteboard/constants';
import { mapObjectMapValues, objectMapEntries } from '@widgets/whiteboard/arrows-common-utils';

const handlesCache = new WeakMapCache<ICustomLine['props'], TLHandle[]>();

export class CustomLineUtil extends ShapeUtil<ICustomLine> {
	static override type = CUSTOM_LINE_SHAPE_ID
	static override props = customLineShapeProps

	override hideResizeHandles = () => true
	override hideRotateHandle = () => true
	override hideSelectionBoundsFg = () => true
	override hideSelectionBoundsBg = () => true

	override getDefaultProps(): ICustomLine['props'] {
		const [start, end] = getIndices(2)
		return {
			dash: 'draw',
			size: ARROW_DEFAULT_SIZE,
			color: DocablyArrowColor.defaultValue,
			spline: 'line',
			points: {
				[start]: { id: start, index: start, x: 0, y: 0 },
				[end]: { id: end, index: end, x: 0.1, y: 0.1 },
			},
		}
	}

	getGeometry(shape: ICustomLine) {
		// todo: should we have min size?
		return getGeometryForLineShape(shape)
	}

	override getHandles(shape: ICustomLine) {
		return handlesCache.get(shape.props, () => {
			const spline = getGeometryForLineShape(shape)

			const points = linePointsToArray(shape)
			const results: TLHandle[] = points.map((point) => ({
				...point,
				id: point.index,
				type: 'vertex',
				canSnap: true,
			}))

			for (let i = 0; i < points.length - 1; i++) {
				const index = getIndexBetween(points[i].index, points[i + 1].index)
				const segment = spline.segments[i]
				const point = segment.midPoint()
				results.push({
					id: index,
					type: 'create',
					index,
					x: point.x,
					y: point.y,
					canSnap: true,
				})
			}

			return results.sort(sortByIndex)
		})
	}

	override onResize: TLOnResizeHandler<ICustomLine> = (shape, info) => {
		const { scaleX, scaleY } = info

		return {
			props: {
				points: mapObjectMapValues(shape.props.points, (_, { id, index, x, y }) => ({
					id,
					index,
					x: x * scaleX,
					y: y * scaleY,
				})),
			},
		}
	}

	
	override onHandleDrag: TLOnHandleDragHandler<ICustomLine> = (shape, { handle }) => {
		if (handle.type !== 'vertex') return

		return {
			...shape,
			props: {
				...shape.props,
				points: {
					...shape.props.points,
					[handle.id]: { id: handle.id, index: handle.index, x: handle.x, y: handle.y },
				},
			},
		}
	}

	component(shape: ICustomLine) {
		const spline = getGeometryForLineShape(shape)
		const strokeWidth = shape.props.size

		const { dash, color } = shape.props

		if (shape.props.spline === 'line') {
			if (dash === 'solid') {
				const outline = spline.points
				const pathData = 'M' + outline[0] + 'L' + outline.slice(1)

				return (
					<SVGContainer id={shape.id}>
						<path d={pathData} stroke={color as string} strokeWidth={strokeWidth} fill="none" />
					</SVGContainer>
				)
			}

			if (dash === 'dashed' || dash === 'dotted') {
				const outline = spline.points
				const pathData = 'M' + outline[0] + 'L' + outline.slice(1)

				return (
					<SVGContainer id={shape.id}>
						{/* <ShapeFill d={pathData} fill={'none'} color={color} theme={theme} /> */}
						<g stroke={color as string} strokeWidth={strokeWidth}>
							{spline.segments.map((segment, i) => {
								const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(
									segment.length,
									strokeWidth,
									{
										style: dash,
										start: i > 0 ? 'outset' : 'none',
										end: i < spline.segments.length - 1 ? 'outset' : 'none',
									}
								)

								return (
									<path
										key={i}
										strokeDasharray={strokeDasharray}
										strokeDashoffset={strokeDashoffset}
										d={getSvgPathForEdge(segment as any, true)}
										fill="none"
									/>
								)
							})}
						</g>
					</SVGContainer>
				)
			}

			if (dash === 'draw') {
				const outline = spline.points
				const [innerPathData, outerPathData] = getDrawLinePathData (shape.id, outline, strokeWidth)

				return (
					<SVGContainer id={shape.id}>
						<path
							d={outerPathData}
							stroke={color as string}
							strokeWidth={strokeWidth}
							fill="none"
						/>
					</SVGContainer>
				)
			}
		}
		if (shape.props.spline === 'cubic') {
			const splinePath = getSvgPathForLineGeometry(spline)
			if (dash === 'solid') {
				return (
					<SVGContainer id={shape.id}>
						<path
							strokeWidth={strokeWidth}
							stroke={color as string}
							fill="none"
							d={splinePath}
						/>
					</SVGContainer>
				)
			}

			if (dash === 'dashed' || dash === 'dotted') {
				return (
					<SVGContainer id={shape.id}>
						<g stroke={color as string} strokeWidth={strokeWidth}>
							{spline.segments.map((segment, i) => {
								const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(
									segment.length,
									strokeWidth,
									{
										style: dash,
										start: i > 0 ? 'outset' : 'none',
										end: i < spline.segments.length - 1 ? 'outset' : 'none',
									}
								)

								return (
									<path
										key={i}
										strokeDasharray={strokeDasharray}
										strokeDashoffset={strokeDashoffset}
										d={getSvgPathForBezierCurve(segment as any, true)}
										fill="none"
									/>
								)
							})}
						</g>
					</SVGContainer>
				)
			}

			if (dash === 'draw') {
				return (
					<SVGContainer id={shape.id}>
						<path
							d={getLineDrawPath(shape as unknown as TLLineShape, spline, strokeWidth)}
							strokeWidth={1}
							stroke={color as string}
							fill={color as string}
						/>
					</SVGContainer>
				)
			}
		}
	}

	indicator(shape: ICustomLine) {
		const strokeWidth = shape.props.size
		const spline = getGeometryForLineShape(shape)
		const { dash } = shape.props

		let path: string

		if (shape.props.spline === 'line') {
			const outline = spline.points
			if (dash === 'solid' || dash === 'dotted' || dash === 'dashed') {
				path = 'M' + outline[0] + 'L' + outline.slice(1)
			} else {
				const [innerPathData] = getDrawLinePathData(shape.id, outline, strokeWidth)
				path = innerPathData
			}
		} else {
			path = getLineIndicatorPath(shape as unknown as TLLineShape, spline, strokeWidth)
		}

		return <path d={path} />
	}

	override getHandleSnapGeometry(shape: ICustomLine): HandleSnapGeometry {
		const points = linePointsToArray(shape)
		return {
			points,
			getSelfSnapPoints: (handle) => {
				const index = this.getHandles(shape)
					.filter((h) => h.type === 'vertex')
					.findIndex((h) => h.id === handle.id)!

				return points.filter((_, i) => Math.abs(i - index) > 1).map(Vec.From)
			},
			getSelfSnapOutline: (handle) => {
				const index = this.getHandles(shape)
					.filter((h) => h.type === 'vertex')
					.findIndex((h) => h.id === handle.id)!

				const segments = (getGeometryForLineShape(shape).segments as any[]).filter(
					(_, i: any) => i !== index - 1 && i !== index
				)

				if (!segments.length) return null
				return new Group2d({ children: segments })
			},
		}
	}
}

function linePointsToArray(shape: ICustomLine) {
	return Object.values(shape.props.points).sort(sortByIndex)
}
