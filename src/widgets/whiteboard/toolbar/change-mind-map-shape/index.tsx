import ButtonPicker from '@shared/uikit/button-picker';
import cn from 'classnames';
import {
  GeoShapeGeoStyle,
  useEditor,
  useValue,
} from '@tldraw/editor';
import { memo, useCallback, useMemo } from 'react';
import {
  MIND_MAP_CHILD_INPUT_SHAPE_ID,
  MIND_MAP_MAIN_INPUT_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import { useSelectedShapes } from '@app/utils/whiteboard/useSelectedShapes';
import { IMindMapMainInput } from '@widgets/whiteboard/mindmap/main-input/mind-map-main-input-types';
import { IMindMapChildInput } from '@widgets/whiteboard/mindmap/child-input/mind-map-child-input-types';
import { TLDokablyMindMapBorder } from '@app/constants/whiteboard/whiteboard-styles';
import styles from './style.module.scss';

const customShapeIds = [MIND_MAP_CHILD_INPUT_SHAPE_ID, MIND_MAP_MAIN_INPUT_SHAPE_ID] as string[];

const ChangeMindMapShape = () => {
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
    () =>
      selectedShapes.every((item) =>
        customShapeIds.includes(item?.type as string)
      ),
    [selectedShapes]
  );

  const changeShape = useCallback(
    (border: TLDokablyMindMapBorder) => {
      const newShapeProps = selectedShapes.map((item) => ({
        ...item,
        props: {
          ...item.props,
          border,
        },
      }));

      editor.createShapes(newShapeProps);
    },
    [selectedShapes]
  );

  const shapeTypesList = useMemo(
    () => [
      {
        icon: (
          <div style={{ width: '30px' }} className={cn('icon')}>
            None
          </div>
        ),
        title: '',
        onClick: () => changeShape('none'),
        border: 'none',
      },
      {
        icon: (
          <div
            style={{
              height: '10px',
              width: '15px',
              borderColor: 'black',
              borderRadius: 6,
              borderStyle: 'solid',
              borderWidth: '1.2px',
            }}
            className={cn('icon')}
          ></div>
        ),
        title: '',
        onClick: () => changeShape('round'),
        border: 'round',
      },
    ],
    [changeShape]
  );

  const buttonPickerItems = useMemo(
    () =>
      shapeTypesList.map(({ icon, title, onClick }) => ({
        icon,
        title,
        onClick,
      })),
    [shapeTypesList]
  );

  const currentShapeIcon = useMemo(() => {
    if (!selectedShapes.length) return shapeTypesList[0].icon;
    if (!areAllCustomShapes) return shapeTypesList[0].icon;
    const currentShape = selectedShapes[0] as
      | IMindMapMainInput
      | IMindMapChildInput;

    const currentShapeBorder = currentShape.props.border;

    const currentShapeInfo =
      shapeTypesList.find((item) => item.border === currentShapeBorder) ||
      shapeTypesList[0];
    return currentShapeInfo.icon;
  }, [selectedShapes, shapeTypesList]);

  if (!selectedShapes.length) return null;
  if (!areAllCustomShapes) return null;

  return (
    <>
      <ButtonPicker
        icon={currentShapeIcon}
        title={'node type'}
        isActive={geoState != undefined && activeTool != 'select'}
        columnCount={2}
        rowCount={1}
        position='bottom'
        childrens={buttonPickerItems}
        listClassName={styles.dropdown}
      />
      <div className='divider' />
    </>
  );
};

export default memo(ChangeMindMapShape);
