import { ARROW_DEFAULT_SIZE, ARROW_MAX_SIZE, ARROW_MIN_SIZE } from '@app/constants/whiteboard/constants';
import {
  CUSTOM_LINE_SHAPE_ID,
  CUSTOM_SOFT_ARROW_SHAPE_ID,
  CUSTOM_SQUARE_ARROW_SHAPE_ID,
  CUSTOM_STRAIGHT_ARROW_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import Slider from '@shared/uikit/slider';
import Tippy from '@tippyjs/react';
import { useEditor, useValue } from '@tldraw/editor';
import { ICustomLine } from '@widgets/whiteboard/custom-shapes/custom-line/custom-line-types';
import { ICustomSoftArrow } from '@widgets/whiteboard/custom-shapes/custom-soft-arrow/custom-soft-arrow-types';
import { ICustomSquareArrow } from '@widgets/whiteboard/custom-shapes/custom-square-arrow/custom-square-arrow-types';
import { ICustomStraightArrow } from '@widgets/whiteboard/custom-shapes/custom-straight-arrow/custom-straight-arrow-types';
import { useMemo } from 'react';

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

const ArrowThickness = () => {
  const editor = useEditor();
  const selectedShapes = useValue(
    'selectedShapes',
    () => editor.getSelectedShapes(),
    [editor]
  );

  const activeSize = useValue(
    'activeSize',
    () => (selectedShapes[0] as ArrowOrLine).props.size || ARROW_DEFAULT_SIZE,
    [editor, selectedShapes]
  );

  const areAllArrows = useMemo(
    () =>
      !!(selectedShapes || []).length &&
      selectedShapes.every((item) => isLineOrArrow(item.type)),
    [selectedShapes]
  );

  const handleChangeSize = (size: number) => {
    if (!areAllArrows) return;

    editor.updateShapes(
      selectedShapes.map((item) => ({
        ...item,
        props: { ...item.props, size },
      }))
    );
  };

  if (!areAllArrows) return null;

  return (
    <>
      <Tippy
        duration={0}
        content={'Thickness'}
        className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
      >
        <div className='w-[63px] h-[38px] flex items-center justify-center mx-[8px]'>
          <Slider
            className='flex items-center cursor-pointer'
            min={ARROW_MIN_SIZE}
            max={ARROW_MAX_SIZE}
            step={1}
            value={activeSize}
            defaultValue={activeSize}
            onValueChange={(value) => handleChangeSize(value)}
          />
        </div>
      </Tippy>
      <div className='divider' />
    </>
  );
};

export default ArrowThickness;
