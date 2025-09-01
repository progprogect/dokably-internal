import { useClickOutside } from '@app/hooks/useClickOutside';
import { useEditor } from '@tldraw/editor';
import cn from 'classnames';
import './style.css';
import { memo, useCallback, useMemo } from 'react';
import {
  DocablyArrowColor,
  TLDokablyArrowColor,
} from '@app/constants/whiteboard/whiteboard-styles';
import ArrowColorButton from './arrow-color-button';
import {
  CUSTOM_SQUARE_ARROW_SHAPE_ID,
  CUSTOM_LINE_SHAPE_ID,
  CUSTOM_STRAIGHT_ARROW_SHAPE_ID,
  CUSTOM_SOFT_ARROW_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import _ from 'lodash';
import { useSelectedShapes } from '@app/utils/whiteboard/useSelectedShapes';
import { ICustomSquareArrow } from '@widgets/whiteboard/custom-shapes/custom-square-arrow/custom-square-arrow-types';
import { ICustomStraightArrow } from '@widgets/whiteboard/custom-shapes/custom-straight-arrow/custom-straight-arrow-types';
import { ICustomLine } from '@widgets/whiteboard/custom-shapes/custom-line/custom-line-types';
import { ICustomSoftArrow } from '@widgets/whiteboard/custom-shapes/custom-soft-arrow/custom-soft-arrow-types';
import Tippy from '@tippyjs/react';

const shapesToApplyColor = [
  CUSTOM_SQUARE_ARROW_SHAPE_ID,
  CUSTOM_STRAIGHT_ARROW_SHAPE_ID,
  CUSTOM_LINE_SHAPE_ID,
  CUSTOM_SOFT_ARROW_SHAPE_ID,
];

type ArrowOrLine =
  | ICustomSquareArrow
  | ICustomStraightArrow
  | ICustomLine
  | ICustomSoftArrow;

const isLineOrArrow = (shapeType: string) => (shapesToApplyColor as string[]).includes(shapeType);

export const ArrowColor = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);
  const editor = useEditor();

  const selectedShapes = useSelectedShapes();

  const areAllArrows = useMemo(
    () =>
      !!(selectedShapes || []).length &&
      selectedShapes.every((item) => isLineOrArrow(item.type)),
    [selectedShapes]
  );

  const currentColor = useMemo(() => {
    if (!areAllArrows) return null;

    const currentShape = selectedShapes[0] as ArrowOrLine;
    return currentShape.props.color || DocablyArrowColor.defaultValue;
  }, [areAllArrows, selectedShapes]);

  const changeFillingColor = useCallback(
    (color: TLDokablyArrowColor) => {
      if (!areAllArrows) return;
      editor.setStyleForSelectedShapes(DocablyArrowColor, color);
    },
    [editor, areAllArrows]
  );

  if (!areAllArrows) return null;

  return (
    <>
      <div
        ref={ref}
        className={cn('toolbar-item', {
          ['toolbar-item__active']: isVisible,
        })}
        onClick={() => setIsVisible(!isVisible)}
      >
        <Tippy
          duration={0}
          content='Color'
          className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
        >
          <div>
            <ArrowColorButton color={currentColor as string} />
          </div>
        </Tippy>
        {isVisible && (
          <div className='toolbar-list'>
            <div
              className='row'
              style={{
                gap: '10px',
                padding: '9px',
              }}
            >
              {DocablyArrowColor.values.map((color: TLDokablyArrowColor) => (
                <ArrowColorButton
                  key={color as string}
                  color={color as string}
                  onClick={() => changeFillingColor(color)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className='divider' />
    </>
  );
};

export default memo(ArrowColor);
