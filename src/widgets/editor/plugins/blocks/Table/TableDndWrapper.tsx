import { ContentBlock, EditorState } from 'draft-js';
import { useEffect, useState } from 'react';
import { moveBlock } from '@app/services/document.service';
import { ReactComponent as Anchor } from '@images/drag-n-drop-icon.svg';
import { getBlockUnder, getOrSetDraggableDelimiter } from '../../decorators/withDnD';
import usePopper from '@app/hooks/usePopper';
import Tooltip from '@shared/uikit/tooltip/Tooltip';
import { TableAnchorMenu } from './TableAnchorMenu';
import ReactDOM from 'react-dom';
import cssStyles from './Table.module.scss';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

interface ITableDNDWrapper {
  block: ContentBlock;
  store: any;
  getEditorState(): EditorState;
  setEditorState(editorState: EditorState): void;
  children: React.ReactNode;
  dndRef: React.RefObject<HTMLDivElement>;
}

const TableDNDWrapper = (props: ITableDNDWrapper) => {
  const refContainer = props.dndRef;
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [anchorMenuIsOpen, setAnchorMenuIsOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offsetY, setOffsetY] = useState(0);
  const [y, setY] = useState(0);
  const [showAnchor, setShowAnchor] = useState(false);

  const { portalId } = useTableContext();

  const handleMouseDragStart = (event: any) => {
    if (event.buttons === 1 && refContainer && refContainer.current) {
      event.preventDefault();
      setIsDragging(true);
      setOffsetY(event.clientY - y);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    if (!isDragging || e.buttons !== 1) return;

    setY(e.clientY - offsetY);
    //
    const blockBefore = getBlockUnder(props.getEditorState().getCurrentContent(), {
      clientX: e.clientX,
      clientY: e.clientY,
    });
    const delimiter = getOrSetDraggableDelimiter();
    if (blockBefore) {
      delimiter.style.top = blockBefore.position.clientY + blockBefore.position.clientHeight + 'px';
      delimiter.style.left = blockBefore.position.clientX + 'px';
      delimiter.style.visibility = 'visible';
    } else {
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    setIsDragging(false);
    setY(0);
    const blockBefore = getBlockUnder(props.getEditorState().getCurrentContent(), {
      clientX: e.clientX,
      clientY: e.clientY,
    });
    if (blockBefore) {
      const editorState = props.getEditorState();
      const newEditorState = moveBlock(editorState, editorState.getSelection(), props.block.getKey(), blockBefore.key);
      props.setEditorState(newEditorState);
    }
    const delimiter = getOrSetDraggableDelimiter();
    delimiter.style.top = '-2000px';
    delimiter.style.left = '-2000px';

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  const handleMouseEnter = () => {
    setShowAnchor(true);
  };

  const handleMouseLeave = () => {
    setShowAnchor(false);
  };

  const handleMouseDragEnd = () => {
    if (y === 0) {
      setAnchorMenuIsOpen((value) => !value);
    }
  };

  const popover = usePopper({
    portalId,
    referenceElement: referenceElement,
    externalStyles: {
      zIndex: 100,
      minWidth: 200,
      maxWidth: 520,
      maxHeight: 400,
      padding: '8px',
    },
    placement: 'bottom',
    children: (
      <TableAnchorMenu
        setAnchorMenuIsOpen={setAnchorMenuIsOpen}
        store={props.store}
        block={props.block}
      />
    ),
  });

  return (
    <div
      ref={refContainer}
      className='draggable'
      style={{
        position: 'relative',
        top: y,
        left: -26,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {anchorMenuIsOpen &&
        ReactDOM.createPortal(
          <div
            className={cssStyles.overlay}
            onClick={() => setAnchorMenuIsOpen(false)}
          />,
          document.body,
        )}
      <Tooltip
        content={
          <>
            Drag to move
            <br />
            Click to open menu
          </>
        }
        disabled={isDragging}
      >
        <Anchor
          ref={setReferenceElement as any}
          className='draggable__anchor'
          onMouseDown={handleMouseDragStart}
          onMouseUp={handleMouseDragEnd}
          style={{
            cursor: isDragging === true ? 'grabbing' : 'grab',
            display: showAnchor || anchorMenuIsOpen || isDragging ? 'block' : 'none',
          }}
        />
      </Tooltip>
      {anchorMenuIsOpen && popover}
      <div className='draggable__content'>{props.children}</div>
    </div>
  );
};

export default TableDNDWrapper;
