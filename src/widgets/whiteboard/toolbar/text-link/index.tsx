import {
  CUSTOM_ARROW_RIGHT_SHAPE_ID,
  CUSTOM_BUBBLE_SHAPE_ID,
  CUSTOM_ELLIPSE_SHAPE_ID,
  CUSTOM_NOTE_SHAPE_ID,
  CUSTOM_PARALLELOGRAM_SHAPE_ID,
  CUSTOM_POLYGON_SHAPE_ID,
  CUSTOM_RECTANGLE_SHAPE_ID,
  CUSTOM_RECTANGLE_SOFT_SHAPE_ID,
  CUSTOM_RHOMBUS_SHAPE_ID,
  CUSTOM_SEXAGON_SHAPE_ID,
  CUSTOM_STAR_SHAPE_ID,
  CUSTOM_TEXT_SHAPE_ID,
  MIND_MAP_CHILD_INPUT_SHAPE_ID,
  MIND_MAP_MAIN_INPUT_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import { ReactComponent as LinkIcon } from '@images/link.svg';
import Tippy from '@tippyjs/react';
import { useEditor, useValue } from '@tldraw/tldraw';
import { useMemo } from 'react';

interface LinkProps {
  openLinkPanel: () => void;
}

const TextLinkButton: React.FC<LinkProps> = ({ openLinkPanel }) => {
  const editor = useEditor();

  const selectedShapes = useValue(
    'selectedShapes',
    () => editor.getSelectedShapes(),
    [editor]
  );

  const showLinkButton = useMemo(() => {
    if ((selectedShapes || []).length > 1) return false;
    if ((selectedShapes || []).length === 0) return false;

    return (
      [
        MIND_MAP_MAIN_INPUT_SHAPE_ID,
        MIND_MAP_CHILD_INPUT_SHAPE_ID,
        CUSTOM_RECTANGLE_SHAPE_ID,
        CUSTOM_RECTANGLE_SOFT_SHAPE_ID,
        CUSTOM_ELLIPSE_SHAPE_ID,
        CUSTOM_POLYGON_SHAPE_ID,
        CUSTOM_RHOMBUS_SHAPE_ID,
        CUSTOM_BUBBLE_SHAPE_ID,
        CUSTOM_PARALLELOGRAM_SHAPE_ID,
        CUSTOM_STAR_SHAPE_ID,
        CUSTOM_ARROW_RIGHT_SHAPE_ID,
        CUSTOM_SEXAGON_SHAPE_ID,
        CUSTOM_TEXT_SHAPE_ID,
        CUSTOM_NOTE_SHAPE_ID,
      ] as string[]
    ).includes(selectedShapes[0].type);
  }, [selectedShapes]);

  if (!showLinkButton) return null;

  return (
    <>
      <button
        onClick={() => openLinkPanel()}
        type='button'
        className='toolbar-item'
        onMouseDown={(e) => e.preventDefault()}
      >
        <Tippy
          duration={0}
          content='Add link'
          className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
        >
          <div>
            <LinkIcon />
          </div>
        </Tippy>
      </button>
      <div className='divider' />
    </>
  );
};

export default TextLinkButton;
