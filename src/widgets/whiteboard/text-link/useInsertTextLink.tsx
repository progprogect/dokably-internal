import { useEditor, useValue } from '@tldraw/tldraw';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { useCallback, useMemo, useState } from 'react';
import { LinkPanel } from '@widgets/components/ToolbarLinkPanel';
import { getQuill } from '@app/utils/whiteboard/quill/utils';

export const useInsertTextLink = () => {
  const quill = getQuill();
  const tldrawEditor = useEditor();

  const selectionBounds = useValue(
    'selectionBounds',
    () => tldrawEditor.getSelectionRotatedPageBounds(),
    [tldrawEditor]
  );

  const selectedShapes = useValue(
    'selectedShapes',
    () => tldrawEditor.getSelectedShapes(),
    [tldrawEditor]
  );

  const activeShape = selectedShapes[0];

  const isEditing = useValue(
    'isEditing',
    () => {
      if (!activeShape?.id) return false;
      return tldrawEditor.getEditingShape()?.id === activeShape?.id
    },
    [tldrawEditor, activeShape?.id]
  );

  const {
    ref: linkPanelRef,
    isVisible: isLinkPanelVisible,
    setIsVisible: setisLinkPanelVisible,
  } = useClickOutside(false);

  const [indexToInsertLinkTo, setindexToInsertLinkTo] = useState(0);
  const [lengthToInsertLinkTo, setlengthToInsertLinkTo] = useState(0);

  const openInsertLinkPanel = useCallback(() => {
    if (!quill) return;

    const length = quill.getLength();
    const range = quill.getSelection();

    if ((!range && length) || !isEditing) {
      quill.setSelection(0, length);
    }

    const newRange = quill.getSelection();
    if (!newRange) return;

    setlengthToInsertLinkTo(newRange.length);
    setindexToInsertLinkTo(newRange.index);
    setisLinkPanelVisible(true);
  }, [quill, isEditing]);

  const linkPanelTop = useMemo(() => {
    if (!selectionBounds) return 0;
    if (!isLinkPanelVisible) return 0;

    const { y, z } = tldrawEditor.getCamera();

    const belowPositionY = (y + selectionBounds.minY) * z;

    return belowPositionY;
  }, [selectionBounds, isLinkPanelVisible, tldrawEditor.getCamera().z, tldrawEditor.getCamera().y]);

  const linkPanelLeft = useMemo(() => {
    if (!selectionBounds) return 0;

    if (!isLinkPanelVisible) return 0;
    const { x, z } = tldrawEditor.getCamera();

    const left = (x + selectionBounds.x) * z;
    return left;
  }, [selectionBounds, isLinkPanelVisible, tldrawEditor.getCamera().z, tldrawEditor.getCamera().x]);

  const insertLinkPanelJsx = isLinkPanelVisible ? (
    <div
      ref={linkPanelRef}
      style={{
        pointerEvents: 'all',
        position: 'absolute',
        zIndex: '1000',
        top: `${linkPanelTop}px`,
        left: `${linkPanelLeft}px`,
      }}
      className='flex justify-end absolute top-[36px] select-none'
    >
      <div className='mt-px bg-white rounded shadow-menu flex items-center w-fit gap-2'>
        <LinkPanel
          onApply={(value) => {
            if (!quill) return;

            if (lengthToInsertLinkTo === 0) {
              quill.insertText(indexToInsertLinkTo, value, 'link', value);
            } else {
              quill.formatText(
                indexToInsertLinkTo,
                lengthToInsertLinkTo,
                'link',
                value
              );
            }

            setlengthToInsertLinkTo(0);
            setindexToInsertLinkTo(0);
            setisLinkPanelVisible(false);

            const shapeState = tldrawEditor.getShape(activeShape.id);
            if (shapeState) {
              const contents = quill.getContents();
              const contentsJson = JSON.stringify(contents);

              tldrawEditor.updateShape({
                ...shapeState,
                props: {
                  ...shapeState?.props,
                  textContents: contentsJson,
                }
              })
            }
          }}
        />
      </div>
    </div>
  ) : null;

  return {
    insertLinkPanelJsx,
    openInsertLinkPanel,
  };
};
