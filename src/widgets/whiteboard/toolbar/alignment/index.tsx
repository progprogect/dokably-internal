import { useClickOutside } from '@app/hooks/useClickOutside';
import { ReactComponent as Align } from '@icons/align.svg';
import { ReactComponent as AlignLeft } from '@icons/align-left.svg';
import { ReactComponent as AlignCenter } from '@icons/align-center.svg';
import { ReactComponent as AlignRight } from '@icons/align-right.svg';
import { ReactComponent as AlignTop } from '@icons/align-top.svg';
import { ReactComponent as AlignMiddle } from '@icons/align-middle.svg';
import { ReactComponent as AlignBottom } from '@icons/align-bottom.svg';

import cn from 'classnames';
import { useEditor, useValue } from '@tldraw/editor';
import { useMemo } from 'react';
import Tippy from '@tippyjs/react';
import {
  DokablyAlign,
  DokablyVerticalAlign,
} from '@app/constants/whiteboard/whiteboard-styles';
import { useSelectedShapes } from '@app/utils/whiteboard/useSelectedShapes';
import { isThereAnyMindMapInput } from '@widgets/whiteboard/mindmap/helpers';

export const Alignment = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);
  const editor = useEditor();

  const selectedShapes = useSelectedShapes();

  const selectionBounds = useValue(
    'selectionBounds',
    () => editor.getSelectionRotatedPageBounds(),
    [editor]
  );

  const showHorizontalAlignmentBtn = useMemo(() => {
    if (isThereAnyMindMapInput(selectedShapes)) return false;

    return (
      !!(selectedShapes || []).length &&
      selectedShapes.every(
        (item) =>
          Object(item?.props).hasOwnProperty('text') &&
          Object(item?.props)?.hasOwnProperty('align')
      )
    );
  }, [selectedShapes]);

  const currentHorizontalAlignment = useMemo(() => {
    return (
      (selectedShapes?.[0]?.props as any)?.align ?? DokablyAlign.defaultValue
    );
  }, [selectedShapes, selectionBounds]);

  const showVerticalAlignmentBtn = useMemo(
    () =>
      !!(selectedShapes || []).length &&
      selectedShapes.every(
        (item) =>
          Object(item?.props).hasOwnProperty('text') &&
          Object(item?.props).hasOwnProperty('verticalAlign')
      ),
    [selectedShapes]
  );

  const currentVerticalAlignment = useMemo(() => {
    return (
      (selectedShapes?.[0]?.props as any)?.verticalAlign ??
      DokablyVerticalAlign.defaultValue
    );
  }, [selectedShapes, selectionBounds]);

  const changeHorizontalAlignment = (value: string) => {
    if (!editor) return;

    const shapesToUpdate = selectedShapes.map((shape) => ({
      id: shape.id,
      type: shape.type,
      props: { align: value },
    }));

    editor.updateShapes(shapesToUpdate);
  };

  const changeVerticalAlignment = (value: string) => {
    if (!editor) return;

    const shapesToUpdate = selectedShapes.map((shape) => ({
      id: shape.id,
      type: shape.type,
      props: { verticalAlign: value },
    }));

    editor.updateShapes(shapesToUpdate);
  };

  const currentAlignStateIcon = useMemo(() => {
    if (!showHorizontalAlignmentBtn) return;
    const shape = selectedShapes[0];
    switch ((shape.props as any).align) {
      case 'left': {
        return <AlignLeft />;
      }
      case 'middle': {
        return <AlignCenter />;
      }
      case 'right': {
        return <AlignRight />;
      }
      default: {
        return <Align />;
      }
    }
  }, [selectedShapes, selectionBounds, showHorizontalAlignmentBtn]);

  if (!showHorizontalAlignmentBtn) return null;

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
        content='Alignment'
        className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
      >
        {currentAlignStateIcon}
      </Tippy>
      {isVisible && (
        <div className='toolbar-list flex-col flex'>
          <div className='row'>
            <Tippy
              duration={0}
              content='Left'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs !mb-[-10px]'
            >
              <button onClick={() => changeHorizontalAlignment('left')}>
                <AlignLeft
                  className={cn('toolbar-item', {
                    ['toolbar-item__active']:
                      currentHorizontalAlignment === 'left',
                  })}
                />
              </button>
            </Tippy>
            <Tippy
              duration={0}
              content='Center'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs !mb-[-10px]'
            >
              <button onClick={() => changeHorizontalAlignment('middle')}>
                <AlignCenter
                  className={cn('toolbar-item', {
                    ['toolbar-item__active']:
                      currentHorizontalAlignment === 'middle',
                  })}
                />
              </button>
            </Tippy>
            <Tippy
              duration={0}
              content='Right'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs !mb-[-10px]'
            >
              <button onClick={() => changeHorizontalAlignment('right')}>
                <AlignRight
                  className={cn('toolbar-item', {
                    ['toolbar-item__active']:
                      currentHorizontalAlignment === 'right',
                  })}
                />
              </button>
            </Tippy>
          </div>
          {showVerticalAlignmentBtn ? (
            <div className='row'>
              <Tippy
                duration={0}
                content='Top'
                className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs !mb-[-10px]'
              >
                <button onClick={() => changeVerticalAlignment('top')}>
                  <AlignTop
                    className={cn('toolbar-item', {
                      ['toolbar-item__active']:
                        currentVerticalAlignment === 'top',
                    })}
                  />
                </button>
              </Tippy>
              <Tippy
                duration={0}
                content='Center'
                className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs !mb-[-10px]'
              >
                <button onClick={() => changeVerticalAlignment('middle')}>
                  <AlignMiddle
                    className={cn('toolbar-item', {
                      ['toolbar-item__active']:
                        currentVerticalAlignment === 'middle',
                    })}
                  />
                </button>
              </Tippy>
              <Tippy
                duration={0}
                content='Bottom'
                className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs !mb-[-10px]'
              >
                <button onClick={() => changeVerticalAlignment('bottom')}>
                  <AlignBottom
                    className={cn('toolbar-item', {
                      ['toolbar-item__active']:
                        currentVerticalAlignment === 'bottom',
                    })}
                  />
                </button>
              </Tippy>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Alignment;
