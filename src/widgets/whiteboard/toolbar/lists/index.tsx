import { useClickOutside } from '@app/hooks/useClickOutside';
import { ReactComponent as BulletList } from '@images/lists/bulletList.svg';
import { ReactComponent as NumberedList } from '@images/lists/numberedList.svg';
import { ReactComponent as BulletListItem } from '@images/lists/bulletListItem.svg';
import { ReactComponent as NumberedListItem } from '@images/lists/numberedListItem.svg';

import cn from 'classnames';
import { useEditor, useValue } from '@tldraw/tldraw';
import Tippy from '@tippyjs/react';
import { getQuill } from '@app/utils/whiteboard/quill/utils';
import { RangeStatic } from 'quill';
import { useMemo } from 'react';
import { isThereAnyMindMapInput } from '@widgets/whiteboard/mindmap/helpers';

type ListType = 'bullet' | 'ordered';

export const Lists = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);

  const editor = useEditor();
  const quill = getQuill();

  const selectedShapes = useValue(
    'selectedShapes',
    () => editor.getSelectedShapes(),
    [editor]
  );

  const activeShape = selectedShapes[0];

  const showBtn = useMemo(() => {
    if (!activeShape) return false;

    if (!quill) return false;
    if (isThereAnyMindMapInput(selectedShapes)) return false;

    return (
      Object(activeShape.props).hasOwnProperty('text') &&
      selectedShapes.length === 1
    );
  }, [activeShape, quill, selectedShapes]);

  const getListFormat = () => {
    if (!quill) return;

    const range = quill.getSelection();

    if (range) {
      const format = quill.getFormat();
      if (format.list) {
        return format.list;
      }
    }
    return null;
  };

  const getIcon = () => {
    const listFormat = getListFormat();
    if (listFormat) {
      if (listFormat === 'ordered') {
        return <NumberedList className='!w-[28px] !h-[28px]' />;
      }
    }
    return <BulletList className='!w-[28px] !h-[28px]' />;
  };

  const isEditing = useValue(
    'isEditing',
    () => editor.getEditingShape()?.id === activeShape.id,
    [editor, activeShape.id]
  );

  const changeListTypeIfRangeSelected = (
    listType: ListType,
    range: RangeStatic
  ) => {
    if (!quill) return;

    const format = quill.getFormat(range);
    const currentListType = format.list;

    const textLength = quill.getText().length;
    const lengthToUse = isEditing ? range.length : textLength;
    const indexToUse = isEditing ? range.index : 0;

    if (currentListType === listType) {
      return quill.formatLine(indexToUse, lengthToUse, 'list', false);
    }

    return quill.formatLine(indexToUse, lengthToUse, 'list', listType);
  };

  const changeListTypeIfRangeNotSelected = (listType: ListType) => {
    if (!quill) return;

    const length = quill.getText().length;
    const format = quill.getFormat(0, length);
    const currentListType = format.list;

    if (currentListType === listType) {
      return quill.formatLine(0, length, 'list', false);
    }
    return quill.formatLine(0, length, 'list', listType);
  };

  const onListTypeChange = (listType: ListType) => {
    if (!quill) return;

    const range = quill.getSelection();
    const text = quill.getText();

    if (range) {
      return changeListTypeIfRangeSelected(listType, range);
    }
    if (text) {
      return changeListTypeIfRangeNotSelected(listType);
    }
  };

  if (!showBtn) return null;

  return (
    <div
      ref={ref}
      className={cn('toolbar-item', {
        ['toolbar-item__active']:
          isVisible ||
          getListFormat() === 'ordered' ||
          getListFormat() === 'bullet',
      })}
      onClick={() => setIsVisible(!isVisible)}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Tippy
        duration={0}
        content='Lists'
        className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
      >
        <div>{getIcon()}</div>
      </Tippy>
      {isVisible && (
        <div className='toolbar-list'>
          <Tippy
            duration={0}
            content='Bulleted list'
            className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
          >
            <div
              className={cn('toolbar-item', {
                ['toolbar-item__active']: getListFormat() === 'bullet',
              })}
              onClick={() => onListTypeChange('bullet')}
            >
              <BulletListItem />
            </div>
          </Tippy>
          <Tippy
            duration={0}
            content='Numbered list'
            className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
          >
            <div
              className={cn('toolbar-item', {
                ['toolbar-item__active']: getListFormat() === 'ordered',
              })}
              onClick={() => onListTypeChange('ordered')}
            >
              <NumberedListItem />
            </div>
          </Tippy>
        </div>
      )}
    </div>
  );
};

export default Lists;
