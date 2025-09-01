import { useClickOutside } from '@app/hooks/useClickOutside';
import { useEditor } from '@tldraw/editor';
import cn from 'classnames';
import './style.css';
import { memo, useCallback, useMemo } from 'react';
import { SHAPE_BORDER_COLORS } from '@app/constants/whiteboard/whiteboard-colors';
import { ICustomRectangle } from '@widgets/whiteboard/custom-shapes/custom-rectangle/custom-rectangle-types';
import { DocablyBorderColor } from '@app/constants/whiteboard/whiteboard-styles';
import ColorButton from './color-button';
import BorderCancelButton from './border-cancel-button';
import CurrentColorButton from './current-color-button';
import { customShapeIds } from '@widgets/whiteboard/shape-tool';
import { useSelectedShapes } from '@app/utils/whiteboard/useSelectedShapes';
import Tippy from '@tippyjs/react';

const BorderColor = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);
  const editor = useEditor();

  const selectedShapes = useSelectedShapes();

  const currentColor = useMemo(
    () =>
      (selectedShapes[0] as ICustomRectangle)?.props?.borderColor || '#29282C',
    [selectedShapes]
  );
  const areAllCustomShapes = useMemo(
    () => selectedShapes.every((item) => customShapeIds.includes(item.type)),
    [selectedShapes]
  );

  const changeFillingColor = useCallback(
    (color: string) => {
      editor.setStyleForSelectedShapes(DocablyBorderColor, color);
    },
    [editor]
  );

  if (!selectedShapes.length) return null;
  if (!areAllCustomShapes) return null;

  return (
    <div
      ref={ref}
      className={cn('toolbar-item', {
        ['toolbar-item__active']: isVisible,
      })}
      onClick={() => setIsVisible(!isVisible)}
    >
      <Tippy
        duration={0}
        content='Border color'
        className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
      >
        <div>
          <CurrentColorButton color={currentColor as string} />
        </div>
      </Tippy>
      {isVisible && (
        <div className='toolbar-list'>
          <div className='row' style={{ gap: '10px', padding: '9px' }}>
            {SHAPE_BORDER_COLORS.filter((item) => item !== 'transparent').map(
              (color) => (
                <ColorButton
                  key={color}
                  color={color}
                  onClick={() => changeFillingColor(color)}
                />
              )
            )}
            <BorderCancelButton
              onClick={() => changeFillingColor('transparent')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(BorderColor);
