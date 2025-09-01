import {
  Box,
  Edge2d,
  Editor,
  Group2d,
  IndexKey,
  Mat,
  MatModel,
  SVGContainer,
  ShapeUtil,
  TLArrowInfo,
  TLArrowShape,
  TLArrowShapeArrowheadStyle,
  TLArrowShapeProps,
  TLArrowShapeTerminal,
  TLHandle,
  TLOnHandleDragHandler,
  TLOnResizeHandler,
  TLOnTranslateHandler,
  TLOnTranslateStartHandler,
  TLShapeId,
  TLShapePartial,
  TLShapeUtilFlag,
  Vec,
  VecLike,
  getArrowTerminalsInArrowSpace,
  toDomPrecision,
} from '@tldraw/tldraw';
import { ICustomSoftArrow } from './custom-soft-arrow-types';
import { useMemo } from 'react';
import { customSoftArrowProps } from './custom-soft-arrow-props';
import { getPerfectDashProps } from './getPerfectDashProps';
import { DocablyArrowColor } from '@app/constants/whiteboard/whiteboard-styles';
import { CUSTOM_SOFT_ARROW_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { ARROW_DEFAULT_SIZE } from '@app/constants/whiteboard/constants';
import { getCurvedArrowHandlePath, getStraightArrowHandlePath } from '@widgets/whiteboard/utils';
import { BoundShapeInfo, calculateAnchorOrientation, getArrowheadPathForType, mapObjectMapValues, objectMapEntries } from '@widgets/whiteboard/arrows-common-utils';

let globalRenderIndex = 0;

enum ARROW_HANDLES {
	START = 'start',
	MIDDLE = 'middle',
	END = 'end',
}

export class CustomSoftArrowUtil extends ShapeUtil<ICustomSoftArrow> {
  static override type = CUSTOM_SOFT_ARROW_SHAPE_ID;
  static override props = customSoftArrowProps;

  override canEdit = () => true;
  override canBind = () => false;
  override canSnap = () => false;
  override hideResizeHandles: TLShapeUtilFlag<ICustomSoftArrow> = () => true;
  override hideRotateHandle: TLShapeUtilFlag<ICustomSoftArrow> = () => true;
  override hideSelectionBoundsBg: TLShapeUtilFlag<ICustomSoftArrow> = () => true;
  override hideSelectionBoundsFg: TLShapeUtilFlag<ICustomSoftArrow> = () => true;

  override getDefaultProps(): ICustomSoftArrow['props'] {
    return {
      color: DocablyArrowColor.defaultValue,
      dash: 'draw',
      size: ARROW_DEFAULT_SIZE,
      arrowheadStart: 'none',
      arrowheadEnd: 'arrow' as const,
      start: { type: 'point', x: 0, y: 0 },
      end: { type: 'point', x: 2, y: 0 },
      bend: 0,
    };
  }

  getGeometry(shape: ICustomSoftArrow) {
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

  override getHandles(shape: ICustomSoftArrow): TLHandle[] {
    const info = getStraightArrowInfo(this.editor, shape)!;
    return [
      {
        id: 'start',
        type: 'vertex',
        index: 'a0' as IndexKey,
        x: info.start.handle.x,
        y: info.start.handle.y,
        canBind: true,
      },
      {
        id: 'end',
        type: 'vertex',
        index: 'a3' as IndexKey,
        x: info.end.handle.x,
        y: info.end.handle.y,
        canBind: true,
      },
    ];
  }

	override onHandleDrag: TLOnHandleDragHandler<ICustomSoftArrow> = (shape, { handle, isPrecise }) => {
		const handleId = handle.id as ARROW_HANDLES

		if (handleId === ARROW_HANDLES.MIDDLE) {
			// Bending the arrow...
			const { start, end } = getArrowTerminalsInArrowSpace(this.editor, shape as unknown as TLArrowShape)

			const delta = Vec.Sub(end, start)
			const v = Vec.Per(delta)

			const med = Vec.Med(end, start)
			const A = Vec.Sub(med, v)
			const B = Vec.Add(med, v)

			const point = Vec.NearestPointOnLineSegment(A, B, handle, false)
			let bend = Vec.Dist(point, med)
			if (Vec.Clockwise(point, end, med)) bend *= -1
			return { id: shape.id, type: shape.type, props: { bend } }
		}

		// Start or end, pointing the arrow...

		const next = structuredClone(shape) as ICustomSoftArrow

		if (this.editor.inputs.ctrlKey) {
			// todo: maybe double check that this isn't equal to the other handle too?
			// Skip binding
			next.props[handleId] = {
				type: 'point',
				x: handle.x,
				y: handle.y,
			}
			return next
		}

		const point = this.editor.getShapePageTransform(shape.id)!.applyToPoint(handle)

		const target = this.editor.getShapeAtPoint(point, {
			hitInside: true,
			hitFrameInside: true,
			margin: 0,
			filter: (targetShape) => {
				return !targetShape.isLocked && this.editor.getShapeUtil(targetShape).canBind(targetShape)
			},
		})

		if (!target) {
			// todo: maybe double check that this isn't equal to the other handle too?
			next.props[handleId] = {
				type: 'point',
				x: handle.x,
				y: handle.y,
			}
			return next
		}

		// we've got a target! the handle is being dragged over a shape, bind to it

		const targetGeometry = this.editor.getShapeGeometry(target)
		const targetBounds = Box.ZeroFix(targetGeometry.bounds)
		const pageTransform = this.editor.getShapePageTransform(next.id)!
		const pointInPageSpace = pageTransform.applyToPoint(handle)
		const pointInTargetSpace = this.editor.getPointInShapeSpace(target, pointInPageSpace)

		let precise = isPrecise

		if (!precise) {
			// If we're switching to a new bound shape, then precise only if moving slowly
			const prevHandle = next.props[handleId]
			if (
				prevHandle.type === 'point' ||
				(prevHandle.type === 'binding' && target.id !== prevHandle.boundShapeId)
			) {
				precise = this.editor.inputs.pointerVelocity.len() < 0.5
			}
		}

		if (!isPrecise) {
			if (!targetGeometry.isClosed) {
				precise = true
			}

			// Double check that we're not going to be doing an imprecise snap on
			// the same shape twice, as this would result in a zero length line
			const otherHandle =
				next.props[handleId === ARROW_HANDLES.START ? ARROW_HANDLES.END : ARROW_HANDLES.START]
			if (
				otherHandle.type === 'binding' &&
				target.id === otherHandle.boundShapeId &&
				otherHandle.isPrecise
			) {
				precise = true
			}
		}

		const normalizedAnchor = {
			x: (pointInTargetSpace.x - targetBounds.minX) / targetBounds.width,
			y: (pointInTargetSpace.y - targetBounds.minY) / targetBounds.height,
		}

		if (precise) {
			// Turn off precision if we're within a certain distance to the center of the shape.
			// Funky math but we want the snap distance to be 4 at the minimum and either
			// 16 or 15% of the smaller dimension of the target shape, whichever is smaller
			if (
				Vec.Dist(pointInTargetSpace, targetBounds.center) <
				Math.max(4, Math.min(Math.min(targetBounds.width, targetBounds.height) * 0.15, 16)) /
					this.editor.getZoomLevel()
			) {
				normalizedAnchor.x = 0.5
				normalizedAnchor.y = 0.5
			}
		}

		next.props[handleId] = {
			type: 'binding',
			boundShapeId: target.id,
			normalizedAnchor: normalizedAnchor,
			isPrecise: precise,
			isExact: this.editor.inputs.altKey,
		}

		if (next.props.start.type === 'binding' && next.props.end.type === 'binding') {
			if (next.props.start.boundShapeId === next.props.end.boundShapeId) {
				if (Vec.Equals(next.props.start.normalizedAnchor, next.props.end.normalizedAnchor)) {
					next.props.end.normalizedAnchor.x += 0.05
				}
			}
		}

		return next
	}

  override onTranslateStart: TLOnTranslateStartHandler<ICustomSoftArrow> = (shape) => {
		const startBindingId =
			shape.props.start.type === 'binding' ? shape.props.start.boundShapeId : null
		const endBindingId = shape.props.end.type === 'binding' ? shape.props.end.boundShapeId : null

		const terminalsInArrowSpace = getArrowTerminalsInArrowSpace(this.editor, shape as unknown as TLArrowShape)
		const shapePageTransform = this.editor.getShapePageTransform(shape.id)!

		// If at least one bound shape is in the selection, do nothing;
		// If no bound shapes are in the selection, unbind any bound shapes

		const selectedShapeIds = this.editor.getSelectedShapeIds()
		const shapesToCheck = new Set<string>()
		if (startBindingId) {
			// Add shape and all ancestors to set
			shapesToCheck.add(startBindingId)
			this.editor.getShapeAncestors(startBindingId).forEach((a) => shapesToCheck.add(a.id))
		}
		if (endBindingId) {
			// Add shape and all ancestors to set
			shapesToCheck.add(endBindingId)
			this.editor.getShapeAncestors(endBindingId).forEach((a) => shapesToCheck.add(a.id))
		}
		// If any of the shapes are selected, return
		for (const id of selectedShapeIds) {
			if (shapesToCheck.has(id)) return
		}

		let result = shape

		// When we start translating shapes, record where their bindings were in page space so we
		// can maintain them as we translate the arrow
		shapeAtTranslationStart.set(shape as unknown as TLArrowShape, {
			pagePosition: shapePageTransform.applyToPoint(shape),
			terminalBindings: mapObjectMapValues(terminalsInArrowSpace, (terminalName, point) => {
				const terminal = shape.props[terminalName]
				if (terminal.type !== 'binding') return null
				return {
					binding: terminal,
					shapePosition: point,
					pagePosition: shapePageTransform.applyToPoint(point),
				}
			}),
		})

		for (const handleName of [ARROW_HANDLES.START, ARROW_HANDLES.END] as const) {
			const terminal = shape.props[handleName]
			if (terminal.type !== 'binding') continue
			result = {
				...shape,
				props: { ...shape.props, [handleName]: { ...terminal, isPrecise: true } },
			}
		}

		return result
	}

  override onTranslate?: TLOnTranslateHandler<ICustomSoftArrow> = (initialShape, shape) => {
		const atTranslationStart = shapeAtTranslationStart.get(initialShape as unknown as TLArrowShape)
		if (!atTranslationStart) return

		const shapePageTransform = this.editor.getShapePageTransform(shape.id)!
		const pageDelta = Vec.Sub(
			shapePageTransform.applyToPoint(shape),
			atTranslationStart.pagePosition
		)

		let result = shape
		for (const [terminalName, terminalBinding] of objectMapEntries(
			atTranslationStart.terminalBindings
		)) {
			if (!terminalBinding) continue

			const newPagePoint = Vec.Add(terminalBinding.pagePosition, Vec.Mul(pageDelta, 0.5))
			const newTarget = this.editor.getShapeAtPoint(newPagePoint, {
				hitInside: true,
				hitFrameInside: true,
				margin: 0,
				filter: (targetShape) => {
					return !targetShape.isLocked && this.editor.getShapeUtil(targetShape).canBind(targetShape)
				},
			})

			if (newTarget?.id === terminalBinding.binding.boundShapeId) {
				const targetBounds = Box.ZeroFix(this.editor.getShapeGeometry(newTarget).bounds)
				const pointInTargetSpace = this.editor.getPointInShapeSpace(newTarget, newPagePoint)
				const normalizedAnchor = {
					x: (pointInTargetSpace.x - targetBounds.minX) / targetBounds.width,
					y: (pointInTargetSpace.y - targetBounds.minY) / targetBounds.height,
				}
				result = {
					...result,
					props: {
						...result.props,
						[terminalName]: { ...terminalBinding.binding, isPrecise: true, normalizedAnchor },
					},
				}
			} else {
				result = {
					...result,
					props: {
						...result.props,
						[terminalName]: {
							type: 'point',
							x: terminalBinding.shapePosition.x,
							y: terminalBinding.shapePosition.y,
						},
					},
				}
			}
		}

		return result
	}

  component(shape: ICustomSoftArrow) {
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

    const strokeWidth = shape.props.size;

    const as =
      info.start.arrowhead &&
      getArrowheadPathForType(info, 'start', strokeWidth);

    const ae =
      info.end.arrowhead && getArrowheadPathForType(info, 'end', strokeWidth);

    const startingAnchorOrientation = calculateAnchorOrientation(info.start.point, info.end.point);
    const endingAnchorOrientation = startingAnchorOrientation;

    const { xPoint: xStart, yPoint: yStart } =
      computeArrowPointAccordingToArrowHead(
        info.start.point.x,
        info.start.point.y,
        0,
        strokeWidth,
        startingAnchorOrientation,
      );

    // Ending point with arrow
    const { xPoint: xEnd, yPoint: yEnd } =
      computeArrowPointAccordingToArrowHead(
        info.end.point.x,
        info.end.point.y,
        4,
        strokeWidth,
        endingAnchorOrientation,
      );

    // Starting position
    const { xAnchor1, yAnchor1 } = computeStartingAnchorPosition(
      xStart,
      yStart,
      xEnd,
      yEnd,
      startingAnchorOrientation,
    );

    // Ending position
    const { xAnchor2, yAnchor2 } = computeEndingAnchorPosition(
      xStart,
      yStart,
      xEnd,
      yEnd,
      endingAnchorOrientation,
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
      const sw = 2;
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

  indicator(shape: ICustomSoftArrow) {
    const { start, end } = getArrowTerminalsInArrowSpace(
      this.editor,
      shape as unknown as TLArrowShape
    );

    const info = getStraightArrowInfo(this.editor, shape);
    const geometry = this.editor.getShapeGeometry<Group2d>(shape);
    const bounds = geometry.bounds;

    if (!info) return null;
    if (Vec.Equals(start, end)) return null;

    const strokeWidth = shape.props.size;

    const as =
      info.start.arrowhead &&
      getArrowheadPathForType(info, 'start', strokeWidth);
    const ae =
      info.end.arrowhead && getArrowheadPathForType(info, 'end', strokeWidth);

    const includeMask =
      (as && info.start.arrowhead !== 'arrow') ||
      (ae && info.end.arrowhead !== 'arrow');

    const maskId = (shape.id + '_clip').replace(':', '_');

    const startingAnchorOrientation = calculateAnchorOrientation(info.start.point, info.end.point);
    const endingAnchorOrientation = startingAnchorOrientation;

    const { xPoint: xStart, yPoint: yStart } =
      computeArrowPointAccordingToArrowHead(
        info.start.point.x,
        info.start.point.y,
        0,
        strokeWidth,
        startingAnchorOrientation,
      );

    // Ending point with arrow
    const { xPoint: xEnd, yPoint: yEnd } =
      computeArrowPointAccordingToArrowHead(
        info.end.point.x,
        info.end.point.y,
        4,
        strokeWidth,
        endingAnchorOrientation,
      );

    // Starting position
    const { xAnchor1, yAnchor1 } = computeStartingAnchorPosition(
      xStart,
      yStart,
      xEnd,
      yEnd,
      startingAnchorOrientation,
    );

    // Ending position
    const { xAnchor2, yAnchor2 } = computeEndingAnchorPosition(
      xStart,
      yStart,
      xEnd,
      yEnd,
      endingAnchorOrientation,
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

    return (
      <g>
        {includeMask && (
          <defs>
            <mask id={maskId}>
              <rect
                x={bounds.minX - 100}
                y={bounds.minY - 100}
                width={bounds.w + 200}
                height={bounds.h + 200}
                fill='white'
              />
              {as && (
                <path
                  d={as}
                  fill={info.start.arrowhead === 'arrow' ? 'none' : 'black'}
                  stroke='none'
                />
              )}
              {ae && (
                <path
                  d={ae}
                  fill={info.end.arrowhead === 'arrow' ? 'none' : 'black'}
                  stroke='none'
                />
              )}
            </mask>
          </defs>
        )}
        {/* firefox will clip if you provide a maskURL even if there is no mask matching that URL in the DOM */}
        <g {...(includeMask ? { mask: `url(#${maskId})` } : undefined)}>
          {/* This rect needs to be here if we're creating a mask due to an svg quirk on Chrome */}
          {includeMask && (
            <rect
              x={bounds.minX - 100}
              y={bounds.minY - 100}
              width={bounds.width + 200}
              height={bounds.height + 200}
              opacity={0}
            />
          )}
          <path d={pathString} />
        </g>
        {as && <path d={as} />}
        {ae && <path d={ae} />}
      </g>
    );
  }

  override onResize: TLOnResizeHandler<ICustomSoftArrow> = (
    shape,
    info
  ) => {
    const { scaleX, scaleY } = info;

    const terminals = getArrowTerminalsInArrowSpace(
      this.editor,
      shape as unknown as TLArrowShape
    );

    const { start, end } = structuredClone(shape.props);
    let { bend } = shape.props;

    // Rescale start handle if it's not bound to a shape
    if (start.type === 'point') {
      start.x = terminals.start.x * scaleX;
      start.y = terminals.start.y * scaleY;
    }

    // Rescale end handle if it's not bound to a shape
    if (end.type === 'point') {
      end.x = terminals.end.x * scaleX;
      end.y = terminals.end.y * scaleY;
    }

    // todo: we should only change the normalized anchor positions
    // of the shape's handles if the bound shape is also being resized

    const mx = Math.abs(scaleX);
    const my = Math.abs(scaleY);

    if (scaleX < 0 && scaleY >= 0) {
      if (bend !== 0) {
        bend *= -1;
        bend *= Math.max(mx, my);
      }

      if (start.type === 'binding') {
        start.normalizedAnchor.x = 1 - start.normalizedAnchor.x;
      }

      if (end.type === 'binding') {
        end.normalizedAnchor.x = 1 - end.normalizedAnchor.x;
      }
    } else if (scaleX >= 0 && scaleY < 0) {
      if (bend !== 0) {
        bend *= -1;
        bend *= Math.max(mx, my);
      }

      if (start.type === 'binding') {
        start.normalizedAnchor.y = 1 - start.normalizedAnchor.y;
      }

      if (end.type === 'binding') {
        end.normalizedAnchor.y = 1 - end.normalizedAnchor.y;
      }
    } else if (scaleX >= 0 && scaleY >= 0) {
      if (bend !== 0) {
        bend *= Math.max(mx, my);
      }
    } else if (scaleX < 0 && scaleY < 0) {
      if (bend !== 0) {
        bend *= Math.max(mx, my);
      }

      if (start.type === 'binding') {
        start.normalizedAnchor.x = 1 - start.normalizedAnchor.x;
        start.normalizedAnchor.y = 1 - start.normalizedAnchor.y;
      }

      if (end.type === 'binding') {
        end.normalizedAnchor.x = 1 - end.normalizedAnchor.x;
        end.normalizedAnchor.y = 1 - end.normalizedAnchor.y;
      }
    }

    const next = {
      props: {
        start,
        end,
        bend,
      },
    };

    return next;
  };

  override onDoubleClickHandle = (
    shape: ICustomSoftArrow,
    handle: TLHandle
  ): TLShapePartial<ICustomSoftArrow> | void => {
    switch (handle.id) {
      case 'start': {
        return {
          id: shape.id,
          type: shape.type,
          props: {
            ...shape.props,
            arrowheadStart:
              shape.props.arrowheadStart === 'none' ? 'arrow' : 'none',
          },
        };
      }
      case 'end': {
        return {
          id: shape.id,
          type: shape.type,
          props: {
            ...shape.props,
            arrowheadEnd:
              shape.props.arrowheadEnd === 'none' ? 'arrow' : 'none',
          },
        };
      }
    }
  };

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

export const STROKE_SIZES: Record<string, number> = {
	s: 2,
	m: 3.5,
	l: 5,
	xl: 10,
}


export function getStraightArrowInfo(editor: Editor, shape: ICustomSoftArrow): TLArrowInfo {
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
      const startShape = startShapeInfo.shape as ICustomSoftArrow

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
      const endShape = endShapeInfo.shape as ICustomSoftArrow

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

const shapeAtTranslationStart = new WeakMap<
	TLArrowShape,
	{
		pagePosition: Vec
		terminalBindings: Record<
			'start' | 'end',
			{
				pagePosition: Vec
				shapePosition: Vec
				binding: Extract<TLArrowShapeProps['start'], { type: 'binding' }>
			} | null
		>
	}
>()