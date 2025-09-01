import { ReactComponent as GroupIcon } from '@icons/group.svg';
import { ReactComponent as UngroupIcon } from '@icons/ungroup.svg';
import Tippy from '@tippyjs/react';
import { TLGroupShape, TLShape, TLShapeId, useEditor, useValue } from '@tldraw/editor';
import _ from 'lodash';
import { useMemo } from 'react';

export const Group = () => {
  const editor = useEditor();

  const selectedShapes = useValue(
    'selectedShapes',
    () => editor.getSelectedShapes(),
    [editor]
  );

  const showGroupBtn = useMemo(
    () => (selectedShapes || []).length > 1,
    [selectedShapes]
  );

  const showUngroupBtn = useMemo(() => {
    const isOnlySelectedShape = (selectedShapes || []).length === 1;
    if (!isOnlySelectedShape) return false;
    const isGroup = editor.isShapeOfType<TLGroupShape>(
      selectedShapes[0],
      'group'
    );
    return isGroup;
  }, [selectedShapes, editor]);

  const onClick = (event: any) => {
    if (!editor) return;

    event.preventDefault();
    event.stopPropagation();

    if (showUngroupBtn) {
      return editor.ungroupShapes(selectedShapes);
    }

    const groupShapes =
      selectedShapes.filter((item) => item.type === 'group') || [];
    const notGroupShapes =
      selectedShapes.filter((item) => item.type !== 'group') || [];
    const notGroupShapesIds = notGroupShapes.length
      ? notGroupShapes.map((item) => item.id)
      : [];

    const allGroupChildrenIds = _.flatMap(groupShapes, (item) => {
      const childrenForOneGroup = editor.getSortedChildIdsForParent(item);
      return childrenForOneGroup;
    });

    if (groupShapes.length) {
      editor.ungroupShapes(groupShapes);
    }

    return editor.groupShapes([
      ...notGroupShapesIds,
      ...allGroupChildrenIds,
    ] as TLShapeId[]);
  };

  if (!showGroupBtn && !showUngroupBtn) return null;

  return (
    <>
      <Tippy
        duration={0}
        content={showUngroupBtn ? 'Ungroup' : 'Group'}
        className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
      >
        <div className='toolbar-item' onClick={onClick}>
          {showGroupBtn && <GroupIcon />}
          {showUngroupBtn && <UngroupIcon />}
        </div>
      </Tippy>
      <div className='divider' />
    </>
  );
};
