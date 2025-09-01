import { PEN_HIGHLIGHT_DEFAULT_COLOR } from '@app/constants/whiteboard/constants';
import { CUSTOM_DRAW_SHAPE_ID, CUSTOM_HIGHLIGHT_SHAPE_ID } from '@app/constants/whiteboard/shape-ids';
import { useClickOutside } from '@app/hooks/useClickOutside';
import Tippy from '@tippyjs/react';
import { useEditor, useValue } from '@tldraw/editor';
import { ICustomHighlight } from '@widgets/whiteboard/custom-shapes/custom-highlight/custom-highlight-types';
import { ICustomPen } from '@widgets/whiteboard/custom-shapes/custom-pen/custom-pen-types';
import cn from 'classnames';

const colors = [
  '#000000',
  '#7B44F0',
  '#FB91AB',
  '#4A86FF',
  '#1FCC78',
  '#FFD600',
  '#FF5065',
  '#A9A9AB',
  '#FFFFFF',
];

const DrawColorPicker = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);
  const editor = useEditor();

  const selectedShapes = useValue(
    'selectedShapes',
    () => editor.getSelectedShapes(),
    [editor]
  );

  const activeShape = selectedShapes[0];

  const activeColor = useValue(
    'activeColor',
    () => {
      if (!activeShape) return PEN_HIGHLIGHT_DEFAULT_COLOR;

      let color = (activeShape as ICustomPen | ICustomHighlight).props.color;
      if (!color) {
        return PEN_HIGHLIGHT_DEFAULT_COLOR;
      }
      if (color && !colors.includes(color as string))
        return PEN_HIGHLIGHT_DEFAULT_COLOR;
      return color as string;
    },
    [editor, activeShape, selectedShapes]
  );

  if (!activeShape) return null;

  return (
    <>
      <Tippy
        duration={0}
        content='Color'
        className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
      >
        <div
          ref={ref}
          className={cn('toolbar-item', {
            ['toolbar-item__active']: isVisible,
          })}
          onClick={() => setIsVisible(!isVisible)}
        >
          <div
            className={cn('color-button__wrapper')}
            style={
              {
                '--color-button': activeColor,
              } as React.CSSProperties
            }
          >
            <div
              className={cn('color-button', {
                'border-[0.5px] border-[var(--text40)]':
                  activeColor.toUpperCase() === '#FFFFFF',
              })}
              style={
                {
                  '--color-button': activeColor,
                } as React.CSSProperties
              }
            ></div>
          </div>

          {isVisible && (
            <div className='toolbar-list'>
              <div className='row' style={{ gap: '10px', padding: '9px' }}>
                {colors.map((color) => (
                  <div
                    key={color}
                    className={cn('color-button__wrapper')}
                    style={
                      {
                        '--color-button': color,
                      } as React.CSSProperties
                    }
                    onClick={() => {
                      selectedShapes
                        .filter(
                          (x) =>
                            x.type === CUSTOM_DRAW_SHAPE_ID ||
                            x.type === CUSTOM_HIGHLIGHT_SHAPE_ID
                        )
                        .forEach((x) => {
                          editor.updateShape({
                            id: x.id,
                            type: x.type,
                            props: {
                              color: color,
                            },
                          });
                        });
                    }}
                  >
                    <div
                      className={cn('color-button', {
                        'border-[0.5px] border-[var(--text40)]':
                          color.toUpperCase() === '#FFFFFF',
                      })}
                      style={
                        {
                          '--color-button': color,
                        } as React.CSSProperties
                      }
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Tippy>
      <div className='divider' />
    </>
  );
};

export default DrawColorPicker;
