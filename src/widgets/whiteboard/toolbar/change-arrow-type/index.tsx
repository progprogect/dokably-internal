import ButtonPicker from '@shared/uikit/button-picker';
import cn from 'classnames';
import { ReactComponent as ArrowSquare } from '@icons/arrow-square.svg';
import { ReactComponent as Line } from '@icons/line.svg';
import { ReactComponent as Arrow } from '@icons/arrow.svg';
import {
  GeoShapeGeoStyle,
  IndexKey,
  TLShapeId,
  VecModel,
  createShapeId,
  useEditor,
  useValue,
} from '@tldraw/editor';
import { memo, useCallback, useMemo } from 'react';
import {
  CUSTOM_SQUARE_ARROW_SHAPE_ID,
  CUSTOM_SQUARE_ARROW_SHAPE_ID_TYPE,
  CUSTOM_LINE_SHAPE_ID,
  CUSTOM_STRAIGHT_ARROW_SHAPE_ID,
  CUSTOM_STRAIGHT_ARROW_SHAPE_ID_TYPE,
  CUSTOM_SOFT_ARROW_SHAPE_ID,
  CUSTOM_SOFT_ARROW_SHAPE_ID_TYPE,
} from '@app/constants/whiteboard/shape-ids';
import { useSelectedShapes } from '@app/utils/whiteboard/useSelectedShapes';
import { ICustomStraightArrow } from '@widgets/whiteboard/custom-shapes/custom-straight-arrow/custom-straight-arrow-types';
import { ICustomSquareArrow } from '@widgets/whiteboard/custom-shapes/custom-square-arrow/custom-square-arrow-types';
import { ICustomLine } from '@widgets/whiteboard/custom-shapes/custom-line/custom-line-types';
import { ICustomSoftArrow } from '@widgets/whiteboard/custom-shapes/custom-soft-arrow/custom-soft-arrow-types';
import Tippy from '@tippyjs/react';
import { useClickOutside } from '@app/hooks/useClickOutside';

const arrowsAndLines = [
  CUSTOM_SQUARE_ARROW_SHAPE_ID,
  CUSTOM_STRAIGHT_ARROW_SHAPE_ID,
  CUSTOM_LINE_SHAPE_ID,
  CUSTOM_SOFT_ARROW_SHAPE_ID,
];

const isCustomArrowNotLine = (shapeType: string) =>
  (
    [CUSTOM_SQUARE_ARROW_SHAPE_ID, CUSTOM_STRAIGHT_ARROW_SHAPE_ID, CUSTOM_SOFT_ARROW_SHAPE_ID] as string[]
  ).includes(shapeType);

type ArrowsNotLinesIds =
  | CUSTOM_SQUARE_ARROW_SHAPE_ID_TYPE
  | CUSTOM_SOFT_ARROW_SHAPE_ID_TYPE
  | CUSTOM_STRAIGHT_ARROW_SHAPE_ID_TYPE;

type ArrowsNotLinesShapes =
  | ICustomSquareArrow
  | ICustomStraightArrow
  | ICustomSoftArrow;

const transformArrowToLine = (
  shape: ArrowsNotLinesShapes
) => {
  return {
    ...shape,
    id: createShapeId(),
    type: CUSTOM_LINE_SHAPE_ID,
    index: shape.index,
    props: {
      dash: shape?.props?.dash,
      size: shape?.props?.size,
      color: shape?.props?.color,
      spline: 'line',
      points: {
        start: {
          id: 'start',
          index: 'a1' as IndexKey,
          x:
            (shape.props.start as { type: 'point'; x: number; y: number })?.x ??
            (
              shape.props.start as {
                type: 'binding';
                boundShapeId: TLShapeId;
                normalizedAnchor: VecModel;
                isExact: boolean;
                isPrecise: boolean;
              }
            ).normalizedAnchor.x,
          y:
            (shape.props.start as { type: 'point'; x: number; y: number })?.y ??
            (
              shape.props.start as {
                type: 'binding';
                boundShapeId: TLShapeId;
                normalizedAnchor: VecModel;
                isExact: boolean;
                isPrecise: boolean;
              }
            ).normalizedAnchor.y,
        },
        end: {
          id: 'end',
          index: 'a2' as IndexKey,
          x:
            (shape.props.end as { type: 'point'; x: number; y: number })?.x ??
            (
              shape.props.end as {
                type: 'binding';
                boundShapeId: TLShapeId;
                normalizedAnchor: VecModel;
                isExact: boolean;
                isPrecise: boolean;
              }
            ).normalizedAnchor.x,
          y:
            (shape.props.end as { type: 'point'; x: number; y: number })?.y ??
            (
              shape.props.end as {
                type: 'binding';
                boundShapeId: TLShapeId;
                normalizedAnchor: VecModel;
                isExact: boolean;
                isPrecise: boolean;
              }
            ).normalizedAnchor.y,
        },
      },
    },
  };
};

const transformLineToArrow = (
  shape: ICustomLine,
  newShapeType: ArrowsNotLinesIds
) => {
  return {
    ...shape,
    id: createShapeId(),
    type: newShapeType,
    props: {
      dash: shape?.props?.dash,
      size: shape?.props?.size,
      color: shape?.props?.color,
      arrowheadStart: 'none',
      arrowheadEnd: 'arrow',
      bend: 0,
      start: {
        type: 'point',
        x: shape.props.points.start.x,
        y: shape.props.points.start.y,
      },
      end: {
        type: 'point',
        x: shape.props.points.end.x,
        y: shape.props.points.end.y,
      },
    },
  };
};

const ChangeArrowType = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);
  const editor = useEditor();

  const activeTool = useValue('activeTool', () => editor.getCurrentToolId(), [
    editor,
  ]);

  const geoState = useValue(
    'geo',
    () => editor.getSharedStyles().getAsKnownValue(GeoShapeGeoStyle),
    [editor]
  );

  const selectedShapes = useSelectedShapes();

  const areArrowsOrLines = useMemo(
    () =>
      selectedShapes.every((item) =>
        (arrowsAndLines as string[]).includes(item?.type)
      ),
    [selectedShapes]
  );

  const areOnlyLines = useMemo(
    () => selectedShapes.every((item) => CUSTOM_LINE_SHAPE_ID === item?.type),
    [selectedShapes]
  );

  const areOnlyArrows = useMemo(
    () => selectedShapes.every((item) => isCustomArrowNotLine(item?.type)),
    [selectedShapes]
  );

  const changeToShape = useCallback(
    (newShapeType: string) => {
      const shapesIdsToRemove = selectedShapes.map((item) => item.id);

      switch (true) {
        case areOnlyLines && isCustomArrowNotLine(newShapeType): {
          const newShapeProps = selectedShapes.map((item) =>
            transformLineToArrow(
              item as ICustomLine,
              newShapeType as ArrowsNotLinesIds
            )
          );
          editor.deleteShapes(shapesIdsToRemove);
          editor.createShapes(newShapeProps);
          return;
        }

        case !areOnlyLines &&
          !areOnlyArrows &&
          isCustomArrowNotLine(newShapeType): {
          const newShapeProps = selectedShapes.map((item) => {
            if (item?.type === CUSTOM_LINE_SHAPE_ID) {
              return transformLineToArrow(
                item as ICustomLine,
                newShapeType as ArrowsNotLinesIds
              );
            }

            return {
              ...item,
              id: createShapeId(),
              type: newShapeType,
              props: {
                ...item.props,
                bend: 0,
              },
            };
          });

          editor.deleteShapes(shapesIdsToRemove);
          editor.createShapes(newShapeProps);
          return;
        }

        case areOnlyArrows && isCustomArrowNotLine(newShapeType): {
          const newShapeProps = selectedShapes.map((item) => ({
            ...item,
            type: newShapeType,
            id: createShapeId(),
            props: {
              ...item.props,
              bend: 0,
            },
          }));

          editor.deleteShapes(shapesIdsToRemove);
          editor.createShapes(newShapeProps);
          return;
        }

        case areOnlyLines && CUSTOM_LINE_SHAPE_ID === newShapeType:
          return;

        case !areOnlyLines &&
          !areOnlyArrows &&
          CUSTOM_LINE_SHAPE_ID === newShapeType: {
          const newShapeProps = selectedShapes.map((item) => {
            if (item?.type === CUSTOM_LINE_SHAPE_ID) return item;
            return transformArrowToLine(item as ArrowsNotLinesShapes);
          });

          editor.deleteShapes(shapesIdsToRemove);
          editor.createShapes(newShapeProps);
          return;
        }

        case areOnlyArrows && CUSTOM_LINE_SHAPE_ID === newShapeType: {
          const newShapeProps = selectedShapes.map((item) =>
            transformArrowToLine(item as ArrowsNotLinesShapes)
          );
          editor.deleteShapes(shapesIdsToRemove);
          editor.createShapes(newShapeProps);
          return;
        }

        default:
          return;
      }
    },
    [selectedShapes, areOnlyArrows]
  );

  const shapeTypesList = useMemo(
    () => [
      {
        icon: <Line className={cn('icon')} />,
        title: 'Line',
        onClick: () => changeToShape(CUSTOM_LINE_SHAPE_ID),
        shapeId: CUSTOM_LINE_SHAPE_ID,
      },
      {
        icon: <Arrow className={cn('icon')} />,
        title: 'Arrow',
        onClick: () => changeToShape(CUSTOM_STRAIGHT_ARROW_SHAPE_ID),
        shapeId: CUSTOM_STRAIGHT_ARROW_SHAPE_ID,
      },
      {
        icon: <ArrowSquare className={cn('icon')} />,
        title: 'Square arrow',
        onClick: () => changeToShape(CUSTOM_SQUARE_ARROW_SHAPE_ID),
        shapeId: CUSTOM_SQUARE_ARROW_SHAPE_ID,
      },
      {
        icon: <ArrowSquare className={cn('icon')} />,
        title: 'Soft arrow',
        onClick: () => changeToShape(CUSTOM_SOFT_ARROW_SHAPE_ID),
        shapeId: CUSTOM_SOFT_ARROW_SHAPE_ID,
      },
    ],
    [changeToShape]
  );

  const currentShapeIcon = useMemo(() => {
    if (!selectedShapes.length) return shapeTypesList[0].icon;
    const currentShapeId = selectedShapes[0].type;

    const currentShapeInfo =
      shapeTypesList.find((item) => item.shapeId === currentShapeId) ||
      shapeTypesList[0];

    return currentShapeInfo.icon;
  }, [selectedShapes, shapeTypesList]);

  if (!selectedShapes.length) return null;
  if (!areArrowsOrLines) return null;

  return (
    <>
      <div
        ref={ref}
        className={cn('toolbar-item', {
          ['toolbar-item__active']: isVisible,
        })}
        onClick={() => setIsVisible(!isVisible)}
        onMouseDown={(e) => e.preventDefault()}
      >
        <Tippy
          duration={0}
          content='Arrow type'
          className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
        >
          <div>{currentShapeIcon}</div>
        </Tippy>
        {isVisible && (
          <div className='toolbar-list'>
            {shapeTypesList.map(({ icon, title, onClick, shapeId }) => (
              <Tippy
                key={shapeId}
                duration={0}
                content={title}
                className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
              >
                <div
                  className={cn('toolbar-item', 'ql-bold')}
                  onClick={onClick}
                >
                  {icon}
                </div>
              </Tippy>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default memo(ChangeArrowType);
