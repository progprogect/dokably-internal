import { EditorState, Modifier, RichUtils } from 'draft-js';

import { ReactComponent as NoColor } from '@images/noColor.svg';
import { ReactComponent as TextHighlight } from '@images/textHighlight.svg';
import cn from 'classnames';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { useState } from 'react';
import Tippy from '@tippyjs/react';
import { track } from '@amplitude/analytics-browser';
import { bgColorStyleMap } from '@app/constants/Editor.styles';
import { EditorProps } from '@entities/props/Editor.props';

const BG_PREFIX = 'bg-';
const BG_COLORS = ['bgBlue', 'bgRed', 'bgOrange', 'bgYellow', 'bgGreen'] as const;
type BgPrefixColorsType = `${typeof BG_PREFIX}${(typeof BG_COLORS)[number]}` | 'bg-none';
type BgColorsType = (typeof BG_COLORS)[number];

const BG_PREFIXED_COLORS = BG_COLORS.map((color) => `${BG_PREFIX}${color}`);

const HighlightModule = (props: EditorProps) => {
  const { editorState, setEditorState } = props;
  const [activeBgColor, setActiveBgColor] = useState<string | null>(null);
  const { ref, isVisible, setIsVisible } = useClickOutside<boolean>(null);

  const handleShowToolPanel = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsVisible(!isVisible);
  };

  const handleChangeColor = (toggledColor: BgPrefixColorsType, event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    track('document_edit_style_selected', { path: 'floating', option: 'highlight' });
    const selection = editorState.getSelection();
    const currentStyle = editorState.getCurrentInlineStyle();
    if (!currentStyle.has(toggledColor)) {
      const nextContentState = Object.keys(bgColorStyleMap).reduce((contentState, color) => {
        return Modifier.removeInlineStyle(contentState, selection, color);
      }, editorState.getCurrentContent());

      let nextEditorState = EditorState.push(editorState, nextContentState, 'change-inline-style');

      if (selection.isCollapsed() && !currentStyle.has(toggledColor)) {
        nextEditorState = currentStyle.reduce((state, color) => {
          if (state && color) {
            return RichUtils.toggleInlineStyle(state, color);
          }
          return editorState;
        }, nextEditorState);
      }
      if (!currentStyle.has(toggledColor) && toggledColor !== 'bg-none') {
        nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, toggledColor);
        setActiveBgColor(toggledColor.split('-')[1] as BgColorsType);
      }
      if (toggledColor === 'bg-none') {
        setActiveBgColor(null);
      }
      setEditorState(nextEditorState);
      setIsVisible(false);
    }
  };

  return (
    <Tippy
      duration={0}
      content='Highlight'
      className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
    >
      <div className='relative flex flex-col items-center justify-center '>
        <div
          ref={ref}
          className='flex items-center justify-center h-7 w-8 cursor-pointer hover:bg-background'
          onMouseDown={(event) => handleShowToolPanel(event)}
        >
          <TextHighlight
            className={cn({
              '[&>path]:fill-primaryHover': activeBgColor,
              '[&>path]:stroke-primaryHover': activeBgColor,
              '[&>rect]:stroke-primaryHover': activeBgColor,
              ['[&>rect]:fill-' + activeBgColor]: activeBgColor,
            })}
          />
        </div>
        {isVisible && (
          <div className='flex justify-end absolute top-[36px] select-none'>
            <div className='mt-px p-2 bg-white rounded shadow-menu flex items-center w-fit gap-2'>
              {BG_PREFIXED_COLORS.map((color) => (
                <div
                  key={color}
                  onMouseDown={(event) => handleChangeColor(color as BgPrefixColorsType, event)}
                  className={cn('p-0.5 rounded-half cursor-pointer', {
                    'border border-primaryHover': BG_PREFIX + activeBgColor === color,
                  })}
                >
                  <div className={cn('h-4 w-4 rounded-half', { [color]: true })} />
                </div>
              ))}
              <div
                onMouseDown={(event) => handleChangeColor('bg-none', event)}
                className={cn('p-0.5 rounded-half cursor-pointer stroke-text40')}
              >
                <NoColor />
              </div>
            </div>
          </div>
        )}
      </div>
    </Tippy>
  );
};

export default HighlightModule;
