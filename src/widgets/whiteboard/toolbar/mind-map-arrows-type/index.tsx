import { useClickOutside } from '@app/hooks/useClickOutside';
import { ReactComponent as LineTypeSoft } from '@icons/line-type-soft.svg';
import { ReactComponent as LineTypeSquare } from '@icons/line-type-square.svg';
import cn from 'classnames';
import { useEditor, useValue } from '@tldraw/editor';
import Tippy from '@tippyjs/react';
import { useCallback, useMemo } from 'react';
import { useSelectedShapes } from '@app/utils/whiteboard/useSelectedShapes';
import {
  MIND_MAP_MAIN_INPUT_SHAPE_ID,
  MIND_MAP_SOFT_ARROW_SHAPE_ID,
  MIND_MAP_SOFT_ARROW_SHAPE_ID_TYPE,
  MIND_MAP_SQUARE_ARROW_SHAPE_ID,
  MIND_MAP_SQUARE_ARROW_SHAPE_ID_TYPE,
} from '@app/constants/whiteboard/shape-ids';
import { IMindMapMainInput } from '@widgets/whiteboard/mindmap/main-input/mind-map-main-input-types';

export const MindMapArrowsType = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);

  const editor = useEditor();

  const onlySelectedShape = useValue(
    'onlySelectedShape',
    () => editor.getOnlySelectedShape(),
    [editor]
  );

  const isShown = useMemo(() => {
    if (!onlySelectedShape) return false;

    return onlySelectedShape.type === MIND_MAP_MAIN_INPUT_SHAPE_ID;
  }, [onlySelectedShape]);

  const currentArrowId = useMemo(() => {
    if (!onlySelectedShape) return MIND_MAP_SOFT_ARROW_SHAPE_ID;

    const arrowId = (onlySelectedShape as IMindMapMainInput).props.arrowId;

    return arrowId ?? MIND_MAP_SOFT_ARROW_SHAPE_ID;
  }, [onlySelectedShape]);

  const updateMainInput = useCallback(
    (
      arrowId:
        | MIND_MAP_SOFT_ARROW_SHAPE_ID_TYPE
        | MIND_MAP_SQUARE_ARROW_SHAPE_ID_TYPE
    ) => {
      if (!onlySelectedShape) return;

      editor.updateShape({
        ...onlySelectedShape,
        props: {
          ...onlySelectedShape?.props,
          arrowId,
        },
      });
    },
    [onlySelectedShape]
  );

  const lineTypesData = useMemo(
    () => [
      {
        arrowId: MIND_MAP_SOFT_ARROW_SHAPE_ID,
        icon: <LineTypeSoft />,
        tooltip: 'Soft',
        onClick: () => updateMainInput(MIND_MAP_SOFT_ARROW_SHAPE_ID),
      },
      {
        arrowId: MIND_MAP_SQUARE_ARROW_SHAPE_ID,
        icon: <LineTypeSquare />,
        tooltip: 'Square',
        onClick: () => updateMainInput(MIND_MAP_SQUARE_ARROW_SHAPE_ID),
      },
    ],
    [updateMainInput]
  );

  const currentLineTypeData = useMemo(() => {
    const lineData = lineTypesData.find(
      (item) => item.arrowId === currentArrowId
    );

    return lineData ?? lineTypesData[0];
  }, [lineTypesData, currentArrowId]);

  if (!isShown) return null;

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
          content='Line type'
          className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
        >
          <div>{currentLineTypeData.icon}</div>
        </Tippy>
        {isVisible && (
          <div className='toolbar-list'>
            {lineTypesData.map((item) => (
              <Tippy
                key={item.arrowId}
                duration={0}
                content={item.tooltip}
                className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
              >
                <div
                  className={cn('toolbar-item', 'ql-bold')}
                  onClick={item.onClick}
                >
                  {item.icon}
                </div>
              </Tippy>
            ))}
          </div>
        )}
      </div>
      <div className='divider' />
    </>
  );
};

export default MindMapArrowsType;
