import { useClickOutside } from '@app/hooks/useClickOutside';
import { useEditor, useValue } from '@tldraw/editor';
import cn from 'classnames';
import './style.css';
import { memo, useCallback, useMemo } from 'react';
import { MIND_MAP_BORDER_COLORS } from '@app/constants/whiteboard/whiteboard-colors';
import { DocablyMindMapBorderColor } from '@app/constants/whiteboard/whiteboard-styles';
import ColorButton from './color-button';
import CurrentColorButton from './current-color-button';
import {
  MIND_MAP_CHILD_INPUT_SHAPE_ID,
  MIND_MAP_MAIN_INPUT_SHAPE_ID,
} from '@app/constants/whiteboard/shape-ids';
import { IMindMapChildInput } from '@widgets/whiteboard/mindmap/child-input/mind-map-child-input-types';
import { IMindMapMainInput } from '@widgets/whiteboard/mindmap/main-input/mind-map-main-input-types';

const MindMapBorderColor = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);
  const editor = useEditor();

  const onlySelectedShape = useValue(
    'onlySelectedShape',
    () => editor.getOnlySelectedShape(),
    [editor]
  );

  const isShown = useMemo(() => {
    if (!onlySelectedShape) return false;

    if (onlySelectedShape.type === MIND_MAP_MAIN_INPUT_SHAPE_ID) return true;
    if (onlySelectedShape.type === MIND_MAP_CHILD_INPUT_SHAPE_ID) return true;

    return false;
  }, [onlySelectedShape]);

  const currentColor = useMemo(() => {
    if (!onlySelectedShape) return '#29282C';
    if (!isShown) return '#29282C';

    const shape = onlySelectedShape as IMindMapMainInput | IMindMapChildInput;

    return shape.props.borderColor;
  }, [onlySelectedShape, isShown]);

  const changeColor = useCallback(
    (color: string) => {
      editor.setStyleForSelectedShapes(DocablyMindMapBorderColor, color);
    },
    [editor]
  );

  if (!isShown) return null;

  return (
    <>
      <div
        ref={ref}
        className={cn('toolbar-item', {
          ['toolbar-item__active']: isVisible,
        })}
        onClick={() => setIsVisible(!isVisible)}
      >
        <CurrentColorButton color={currentColor as string} />

        {isVisible && (
          <div className='toolbar-list'>
            <div className='row' style={{ gap: '10px', padding: '9px' }}>
              {MIND_MAP_BORDER_COLORS.map(
                (color) => (
                  <ColorButton
                    key={color}
                    color={color}
                    onClick={() => changeColor(color)}
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>
      <div className='divider' />
    </>
  );
};

export default memo(MindMapBorderColor);
