import { useEditor, useValue } from '@tldraw/tldraw';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EditLinkPanel } from '@widgets/components/ToolbarLinkPanel';
import { getQuill } from '@app/utils/whiteboard/quill/utils';
import { BoundsStatic } from 'quill';

export const useEditTextLink = () => {
  const quill = getQuill();
  const editor = useEditor();

  const selectionBounds = useValue(
    'selectionBounds',
    () => editor.getSelectionRotatedPageBounds(),
    [editor]
  );

  const {
    ref: editLinkRef,
    isVisible: isLinkEditVisible,
    setIsVisible: setLinkEditVisible,
  } = useClickOutside(false);

  const [boundsToUse, setBounds] = useState<BoundsStatic | null>();
  const [linkStartIndex, setlinkStartIndex] = useState(0);

  const [linkLength, setlinkLength] = useState(0);
  const [link, setLink] = useState<string>();

  const currentLinkComponent = useRef(null);

  const top = useMemo(() => {
    if (!selectionBounds) return 0;

    if (!isLinkEditVisible) return 0;
    if (!boundsToUse) return 0;

    const { y, z } = editor.getCamera();
    const belowPositionY =
      (y + selectionBounds.minY) * z + boundsToUse.top + 20;

    return belowPositionY;
  }, [
    selectionBounds,
    isLinkEditVisible,
    boundsToUse,
    editor.getCamera().z,
    editor.getCamera().y,
  ]);

  const left = useMemo(() => {
    if (!selectionBounds) return 0;

    if (!isLinkEditVisible) return 0;
    if (!boundsToUse) return 0;

    const { x, z } = editor.getCamera();
    const left = (x + selectionBounds.x) * z + boundsToUse.left;

    return left;
  }, [
    selectionBounds,
    isLinkEditVisible,
    boundsToUse,
    editor.getCamera().z,
    editor.getCamera().x,
  ]);

  useEffect(() => {
    if (!quill) return;

    quill.on('selection-change', function (range) {
      if (!range) return;

      const [currentQuillBlot, offset] = quill.getLeaf(range.index);
      const currentQuillComponent = currentQuillBlot.parent;

      const format = quill.getFormat(range);
      const bounds = quill.getBounds(range.index);

      setlinkStartIndex(range.index - offset);
      setlinkLength(currentQuillComponent?.children?.head?.text?.length || 0);

      if (!!format?.link) {
        setLinkEditVisible(!!format?.link);
        setLink(format?.link);

        setBounds(bounds);
        currentLinkComponent.current = currentQuillComponent;
      } else {
        setLinkEditVisible(false);
        setBounds(null);
      }
    });
  }, [quill]);

  const saveChangesToTldrawState = () => {
    setTimeout(() => {
      const shapeState = editor.getSelectedShapes()[0];
      if (shapeState) {
        const contents = quill.getContents();
        const contentsJson = JSON.stringify(contents);

        editor.updateShape({
          ...shapeState,
          props: {
            ...shapeState?.props,
            textContents: contentsJson,
          }
        })
      }

    }, 200);
  }

  const editLinkPanelJsx =
    isLinkEditVisible && selectionBounds ? (
      <div
        style={{
          pointerEvents: 'all',
          position: 'absolute',
          zIndex: '1000',
          top: `${top}px`,
          left: `${left}px`,
        }}
        className='mt-px bg-white rounded shadow-menu flex items-center w-fit gap-2'
        ref={editLinkRef}
      >
        <EditLinkPanel
          value={link}
          onEdit={(value) => {
            if (!quill) return;

            if (currentLinkComponent.current) {
              //@ts-ignore
              currentLinkComponent.current.format('link', value);
            }
            saveChangesToTldrawState();
            setLinkEditVisible(false);
            setBounds(null);
          }}
          onDelete={() => {
            if (!quill) return;

            quill.removeFormat(linkStartIndex, linkLength);

            saveChangesToTldrawState();
            setLinkEditVisible(false);
            setBounds(null);
          }}
        />
      </div>
    ) :
    null;

    return {
      editLinkPanelJsx,
    };
};
