import { useClickOutside } from '@app/hooks/useClickOutside';
import './../style.css';
import { Box, useEditor, useValue } from '@tldraw/editor';
import { MoreHorizontal } from 'lucide-react';import cn from 'classnames';
import Tippy from '@tippyjs/react';
import {
  useCopyAs,
  useExportAs,
  useMenuClipboardEvents,
} from '@tldraw/tldraw';
import _ from 'lodash';

export const More = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);
  const editor = useEditor();
  const copyAs = useCopyAs();
  const exportAs = useExportAs();
  const { copy } = useMenuClipboardEvents();

  const selectedShapes = useValue(
    'selectedShapes',
    () => editor.getSelectedShapes(),
    [editor]
  );

  const changeFontFamily = (value: string) => {
    if (selectedShapes.length === 1) {
      const shape = selectedShapes[0];
      editor.updateShapes([
        { id: shape.id, type: shape.type, props: { fontFamily: value } },
      ]);
    }
  };

  function hasSelectedShapes() {
    return editor.getSelectedShapeIds().length > 0;
  }

  function mustGoBackToSelectToolFirst() {
    if (!editor.isIn('select')) {
      editor.complete();
      editor.setCurrentTool('select');
      return false;
    }

    return false;
  }

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
        content='More'
        className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
      >
        <div>
          <MoreHorizontal />
        </div>
      </Tippy>
      {isVisible && (
        <div className='toolbar-list' style={{ right: '-6px', width: '210px' }}>
          <div className='column hover:!bg-transparent' style={{ width: '100%' }}>
            <button
              className={cn('toolbar-item')}
              onClick={() => {
                editor.toggleLock(selectedShapes);
              }}
            >
              Lock
            </button>
            {/* <button className={cn('toolbar-item')}>Create frame</button>
            <button className={cn('toolbar-item')}>Add comment</button> */}
            <button
              className={cn('toolbar-item')}
              onClick={() => {
                editor.bringToFront(selectedShapes.map((x) => x.id));
              }}
            >
              Bring to front
            </button>
            <button
              className={cn('toolbar-item')}
              onClick={() => {
                editor.sendToBack(selectedShapes.map((x) => x.id));
              }}
            >
              Send to back
            </button>
            <button
              className={cn('toolbar-item')}
              onClick={() => {
                copy('actions-menu');
              }}
            >
              Copy
            </button>
            <button
              className={cn('toolbar-item')}
              onClick={() => {
                copyAs(
                  selectedShapes.map((x) => x.id),
                  'png'
                );
              }}
            >
              Copy as image
            </button>
            <button
              className={cn('toolbar-item')}
              onClick={() => {
                if (!hasSelectedShapes()) return;
                if (mustGoBackToSelectToolFirst()) return;

                const ids = editor.getSelectedShapeIds();
                const commonBounds = Box.Common(
                  _.compact(ids.map((id) => editor.getShapePageBounds(id)))
                );
                const offset = editor.getInstanceState().canMoveCamera
                  ? {
                      x: commonBounds.width + 10,
                      y: 0,
                    }
                  : {
                      x: 16 / editor.getZoomLevel(),
                      y: 16 / editor.getZoomLevel(),
                    };
                editor.mark('duplicate shapes');
                editor.duplicateShapes(ids, offset);

                // editor.duplicateShapes(selectedShapes.map((x) => x.id));
              }}
            >
              Duplicate
            </button>
            <button
              className={cn('toolbar-item')}
              onClick={() => {
                exportAs(
                  selectedShapes.map((x) => x.id),
                  'png',
                  'image'
                );
              }}
            >
              Export as image
            </button>
            <button
              className={cn('toolbar-item')}
              onClick={() => {
                editor.deleteShapes(selectedShapes.map((x) => x.id));
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default More;
