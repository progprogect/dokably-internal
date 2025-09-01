import { ReactComponent as LockIcon } from '@icons/lock.svg';
import { ReactComponent as UnlockIcon } from '@icons/unlock.svg';
import Tippy from '@tippyjs/react';
import { useEditor, useValue } from '@tldraw/editor';

export const Lock = () => {
  const editor = useEditor();

  const selectedShapes = useValue(
    'selectedShapes',
    () => editor.getSelectedShapes(),
    [editor]
  );

  const showBtn = !!(selectedShapes || []).length;

  const isLocked = editor.isShapeOrAncestorLocked(selectedShapes[0]);

  if (!showBtn) return null;

  return (
    <>
      <Tippy
        duration={0}
        content={isLocked ? 'Unlock' : 'Lock'}
        className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs mb-[5px]'
      >
        <div
          className='toolbar-item'
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            editor.toggleLock(selectedShapes);
          }}
        >
          {isLocked ? <UnlockIcon /> : <LockIcon /> }
        </div>
      </Tippy>
      {!isLocked && <div className='divider' />}
    </>
  );
};

export default Lock;
