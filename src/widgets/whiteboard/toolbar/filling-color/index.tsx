import { useClickOutside } from '@app/hooks/useClickOutside';
import { useEditor, useValue } from '@tldraw/editor';
import cn from 'classnames';
import './style.css';
import { memo, useCallback, useMemo } from 'react';
import { ICustomRectangle } from '@widgets/whiteboard/custom-shapes/custom-rectangle/custom-rectangle-types';
import {
  DocablyBgColor,
  DokablyNoteBgColor,
  TLDokablyBgColor,
  TLDokablyNoteBgColor,
} from '@app/constants/whiteboard/whiteboard-styles';
import FillingColorButton from './filling-color-button';
import CancelButton from './cancel-button';
import { customShapeIds } from '@widgets/whiteboard/shape-tool';
import { CUSTOM_NOTE_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { ICustomNote } from '@widgets/whiteboard/custom-shapes/custom-note/custom-note-types';
import _ from 'lodash';
import { useSelectedShapes } from '@app/utils/whiteboard/useSelectedShapes';
import Tippy from '@tippyjs/react';

export const FillingColor = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);
  const editor = useEditor();

  const selectedShapes = useSelectedShapes();

  const areAllCustomShapes = useMemo(
    () =>
      !!(selectedShapes || []).length &&
      selectedShapes.every((item) => customShapeIds.includes(item.type)),
    [selectedShapes]
  );

  const areAllStickyNotes = useMemo(
    () =>
      !!(selectedShapes || []).length &&
      selectedShapes.every((item) => CUSTOM_NOTE_SHAPE_ID === item.type),
    [selectedShapes]
  );

  const colorSetToUse = useMemo(() => {
    if (areAllCustomShapes) return DocablyBgColor;
    if (areAllStickyNotes) return DokablyNoteBgColor;
    return null;
  }, [areAllCustomShapes, areAllStickyNotes]);

  const currentColor = useMemo(() => {
    if (!colorSetToUse) return null;

    const currentShape = selectedShapes[0] as ICustomRectangle | ICustomNote;
    return currentShape.props.fill || colorSetToUse.defaultValue;
  }, [areAllCustomShapes, areAllStickyNotes, colorSetToUse, selectedShapes]);

  const changeFillingColor = useCallback(
    (color: TLDokablyBgColor | TLDokablyNoteBgColor) => {
      if (!colorSetToUse) return;
      editor.setStyleForSelectedShapes(colorSetToUse, color);
    },
    [editor, colorSetToUse]
  );

  if (!colorSetToUse) return null;
  if (!currentColor) return null;

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
          content='Fill color'
          className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
        >
          <div>
            <FillingColorButton color={currentColor as string} />
          </div>
        </Tippy>
        {isVisible && (
          <div className='toolbar-list'>
            <div
              className='row'
              style={{
                gap: '10px',
                padding: '9px',
                ...(areAllStickyNotes
                  ? { minWidth: `${7 * 18 + 6 * 10 + 18}px` }
                  : {}),
                ...(areAllStickyNotes ? { flexWrap: 'wrap' } : {}),
              }}
            >
              {colorSetToUse.values
                .filter(
                  (item: TLDokablyBgColor | TLDokablyNoteBgColor) =>
                    item !== 'transparent'
                )
                .map((color: TLDokablyBgColor | TLDokablyNoteBgColor) => (
                  <FillingColorButton
                    key={color as string}
                    color={color as string}
                    onClick={() => changeFillingColor(color)}
                  />
                ))}
              {areAllCustomShapes && (
                <CancelButton
                  onClick={() => changeFillingColor('transparent')}
                />
              )}
            </div>
          </div>
        )}
      </div>
      <div className='divider' />
    </>
  );
};

export default memo(FillingColor);
