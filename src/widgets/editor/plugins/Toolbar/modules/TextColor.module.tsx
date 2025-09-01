import { EditorState, Modifier, RichUtils } from 'draft-js';

import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as TextColor } from '@images/textColor.svg';
import cn from 'classnames';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { useState } from 'react';
import Tippy from '@tippyjs/react';
import { track } from '@amplitude/analytics-browser';
import { colorStyleMap } from '@app/constants/Editor.styles';

const BG_PREFIX = 'bg-';
const FONT_PREFIX = 'text-';
const FONT_COLORS = [
  'text',
  'fontPurple',
  'fontDarkBlue',
  'fontBlue',
  'fontGreen',
  'fontRed',
  'fontYellow',
  'fontGray',
] as const;

type TextPrefixColorType = `${typeof FONT_PREFIX}${(typeof FONT_COLORS)[number]}`;
type TextColorType = (typeof FONT_COLORS)[number];

const TextColorModule = (props: EditorProps) => {
  const { editorState, setEditorState } = props;
  const [activeFontColor, setActiveFontColor] = useState<string | null>(null);
  const { ref, isVisible, setIsVisible } = useClickOutside<boolean>(null);

  const handleChangeColor = (toggledColor: TextPrefixColorType, event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const selection = editorState.getSelection();
    const currentStyle = editorState.getCurrentInlineStyle();
    track('document_edit_style_selected', {
      path: 'floating',
      option: 'color',
    });
    if (!currentStyle.has(toggledColor)) {
      const nextContentState = Object.keys(colorStyleMap).reduce((contentState, color) => {
        return Modifier.removeInlineStyle(contentState, selection, color);
      }, editorState.getCurrentContent());

      let nextEditorState = EditorState.push(editorState, nextContentState, 'change-inline-style');

      // Unset style override for current color.
      if (selection.isCollapsed() && !currentStyle.has(toggledColor)) {
        nextEditorState = currentStyle.reduce((state, color) => {
          if (state && color) {
            return RichUtils.toggleInlineStyle(state, color);
          }
          return editorState;
        }, nextEditorState);
      }
      // If the color is being toggled on, apply it.
      if (!currentStyle.has(toggledColor)) {
        nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, toggledColor);
        const activeFontColor = toggledColor.split('-')[1] as TextColorType;
        setActiveFontColor(activeFontColor === 'text' ? null : activeFontColor);
      }
      setEditorState(nextEditorState);
      setIsVisible(false);
    }
  };

  const handleShowToolPanel = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsVisible(!isVisible);
  };

  return (
    <Tippy
      duration={0}
      content='Text color'
      className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
    >
      <div className='relative flex flex-col items-center justify-center '>
        <div
          ref={ref}
          className='flex flex-col items-center justify-center h-7 w-8 cursor-pointer hover:bg-background '
          onMouseDown={(event) => handleShowToolPanel(event)}
        >
          <TextColor
            className={cn({
              '[&>path]:fill-primaryHover': activeFontColor,
              '[&>path]:stroke-primaryHover': activeFontColor,
              ['[&>ellipse]:fill-' + activeFontColor]: activeFontColor,
            })}
          />
        </div>
        {isVisible && (
          <div className='flex justify-end absolute top-[36px] select-none'>
            <div className='mt-px p-2 bg-white rounded shadow-menu flex items-center w-fit gap-2'>
              {FONT_COLORS.map((color) => (
                <div
                  key={color}
                  onMouseDown={(event) => handleChangeColor(`${FONT_PREFIX}${color}`, event)}
                  className={cn('p-0.5 rounded-half cursor-pointer', {
                    'border border-primaryHover': activeFontColor === color,
                  })}
                >
                  <div
                    className={cn('h-4 w-4 rounded-half', {
                      [BG_PREFIX + color]: true,
                    })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Tippy>
  );
};

export default TextColorModule;
