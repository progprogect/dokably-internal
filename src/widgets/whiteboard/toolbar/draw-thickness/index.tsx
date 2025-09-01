import {
  HIGHLIGHT_DEFAULT_SIZE,
  PEN_DEFAULT_SIZE,
} from '@app/constants/whiteboard/constants';
import { CUSTOM_DRAW_SHAPE_ID, CUSTOM_HIGHLIGHT_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import Slider from '@shared/uikit/slider';
import Tippy from '@tippyjs/react';
import { useEditor, useValue } from '@tldraw/editor';
import { ICustomHighlight } from '@widgets/whiteboard/custom-shapes/custom-highlight/custom-highlight-types';
import { ICustomPen } from '@widgets/whiteboard/custom-shapes/custom-pen/custom-pen-types';

import cn from 'classnames';

const DrawThickness = () => {
  const editor = useEditor();
  const selectedShapes = useValue(
    'selectedShapes',
    () => editor.getSelectedShapes(),
    [editor]
  );

  const activeShape = selectedShapes[0];

  const activeSize = useValue(
    'activeSize',
    () => {
      if (!activeShape) return PEN_DEFAULT_SIZE;
      if (
        activeShape.type === CUSTOM_HIGHLIGHT_SHAPE_ID ||
        activeShape.type === CUSTOM_DRAW_SHAPE_ID
      ) {
        if (activeShape.type === CUSTOM_DRAW_SHAPE_ID) {
          return (activeShape as ICustomPen).props.size ?? PEN_DEFAULT_SIZE;
        }
        if (activeShape.type === CUSTOM_HIGHLIGHT_SHAPE_ID) {
          return (
            (activeShape as ICustomHighlight).props.size ??
            HIGHLIGHT_DEFAULT_SIZE
          );
        }
      }
      return PEN_DEFAULT_SIZE;
    },
    [editor, activeShape, selectedShapes]
  );

  const handleChangeSize = (size: number) => {
    if (!activeShape) return;

    editor.updateShape({
      id: activeShape.id,
      type: activeShape.type,
      props: {
        size: size,
      },
    });
  };

  if (!activeShape) return null;

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
            min={1}
            max={20}
            step={1}
            //@ts-ignore
            value={activeSize}
            //@ts-ignore
            defaultValue={activeSize}
            onValueChange={(value) => handleChangeSize(value)}
          />
        </div>
      </Tippy>
      <div className='divider' />
    </>
  );
};

export default DrawThickness;
