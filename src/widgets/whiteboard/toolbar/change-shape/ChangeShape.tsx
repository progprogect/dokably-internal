import ButtonPicker from '@shared/uikit/button-picker';
import cn from 'classnames';
import { ReactComponent as Rectangle } from '@icons/shapes/rectangle.svg';
import { ReactComponent as RectangleSoft } from '@icons/shapes/rectangle-soft.svg';
import { ReactComponent as Ellipse } from '@icons/shapes/ellipse.svg';
import { ReactComponent as Polygon } from '@icons/shapes/polygon.svg';
import { ReactComponent as Rhombus } from '@icons/shapes/rhombus.svg';
import { ReactComponent as BubbleSquare } from '@icons/shapes/bubble-square.svg';
import { ReactComponent as Parallelogram } from '@icons/shapes/parallelogram.svg';
import { ReactComponent as Star } from '@icons/shapes/star.svg';
import { ReactComponent as ArrowRight } from '@icons/shapes/arrow-right.svg';
import { ReactComponent as Sexagon } from '@icons/shapes/sexagon.svg';
import {
  GeoShapeGeoStyle,
  useEditor,
  useValue,
} from '@tldraw/editor';
import { memo, useCallback, useMemo } from 'react';
import { customShapeIds } from '@widgets/whiteboard/shape-tool';
import {
  CUSTOM_ARROW_RIGHT_SHAPE_ID,
  CUSTOM_BUBBLE_SHAPE_ID,
  CUSTOM_ELLIPSE_SHAPE_ID,
  CUSTOM_PARALLELOGRAM_SHAPE_ID,
  CUSTOM_POLYGON_SHAPE_ID,
  CUSTOM_RECTANGLE_SHAPE_ID,
  CUSTOM_RECTANGLE_SOFT_SHAPE_ID,
  CUSTOM_RHOMBUS_SHAPE_ID,
  CUSTOM_SEXAGON_SHAPE_ID,
  CUSTOM_STAR_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import { useSelectedShapes } from '@app/utils/whiteboard/useSelectedShapes';
import styles from './style.module.scss';

const ChangeShape = () => {
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

  const areAllCustomShapes = useMemo(
    () => selectedShapes.every((item) => customShapeIds.includes(item?.type as string)),
    [selectedShapes]
  );

  const changeToShape = useCallback(
    (newShapeType: string) => {
      const newShapeProps = selectedShapes.map((item) => ({
        ...item,
        type: newShapeType,
      }))

      editor.createShapes(newShapeProps);
    },
    [selectedShapes],
  );

  const shapeTypesList = useMemo(() => [
    {
      icon: <Rectangle className={cn('icon')} />,
      title: 'Rectangle',
      onClick: () => changeToShape(CUSTOM_RECTANGLE_SHAPE_ID),
      shapeId: CUSTOM_RECTANGLE_SHAPE_ID,
    },
    {
      icon: <RectangleSoft className={cn('icon')} />,
      title: 'Rectangle soft',
      onClick: () => changeToShape(CUSTOM_RECTANGLE_SOFT_SHAPE_ID),
      shapeId: CUSTOM_RECTANGLE_SOFT_SHAPE_ID,
    },
    {
      icon: <Ellipse className={cn('icon')} />,
      title: 'Ellipse',
      onClick: () => changeToShape(CUSTOM_ELLIPSE_SHAPE_ID),
      shapeId: CUSTOM_ELLIPSE_SHAPE_ID,
    },
    {
      icon: <Polygon className={cn('icon')} />,
      title: 'Polygon',
      onClick: () => changeToShape(CUSTOM_POLYGON_SHAPE_ID),
      shapeId: CUSTOM_POLYGON_SHAPE_ID,
    },
    {
      icon: <Rhombus className={cn('icon')} />,
      title: 'Rhombus',
      onClick: () => changeToShape(CUSTOM_RHOMBUS_SHAPE_ID),
      shapeId: CUSTOM_RHOMBUS_SHAPE_ID,
    },
    {
      icon: <BubbleSquare className={cn('icon')} />,
      title: 'Bubble square',
      onClick: () => changeToShape(CUSTOM_BUBBLE_SHAPE_ID),
      shapeId: CUSTOM_BUBBLE_SHAPE_ID,
    },
    {
      icon: <Parallelogram className={cn('icon')} />,
      title: 'Parallelogram',
      onClick: () => changeToShape(CUSTOM_PARALLELOGRAM_SHAPE_ID),
      shapeId: CUSTOM_PARALLELOGRAM_SHAPE_ID,
    },
    {
      icon: <Star className={cn('icon')} />,
      title: 'Star',
      onClick: () => changeToShape(CUSTOM_STAR_SHAPE_ID),
      shapeId: CUSTOM_STAR_SHAPE_ID,
    },
    {
      icon: <ArrowRight className={cn('icon')} />,
      title: 'Arrow right',
      onClick: () => changeToShape(CUSTOM_ARROW_RIGHT_SHAPE_ID),
      shapeId: CUSTOM_ARROW_RIGHT_SHAPE_ID,
    },
    {
      icon: <Sexagon className={cn('icon')} />,
      title: 'Sexagon',
      onClick: () => changeToShape(CUSTOM_SEXAGON_SHAPE_ID),
      shapeId: CUSTOM_SEXAGON_SHAPE_ID,
    },
  ], [changeToShape]);

  const buttonPickerItems = useMemo(() => shapeTypesList.map(({ icon, title, onClick }) => ({ icon, title, onClick })), [shapeTypesList]);
  const currentShapeIcon = useMemo(() => {
    if (!selectedShapes.length) return shapeTypesList[0].icon;
    const currentShapeId = selectedShapes[0].type;
    const currentShapeInfo = shapeTypesList.find(item => item.shapeId === currentShapeId) || shapeTypesList[0];
    return currentShapeInfo.icon
  }, [selectedShapes, shapeTypesList]);

  if (!selectedShapes.length) return null;
  if (!areAllCustomShapes) return null;

  return (
    <ButtonPicker
      icon={currentShapeIcon}
      title={'Shapes'}
      isActive={geoState != undefined && activeTool != 'select'}
      columnCount={5}
      rowCount={2}
      position='bottom'
      childrens={buttonPickerItems}
      listClassName={styles.dropdown}
    />
  );
};

export default memo(ChangeShape);
