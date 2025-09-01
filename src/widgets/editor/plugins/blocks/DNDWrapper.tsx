import { ContentBlock, EditorState } from 'draft-js';
import { useEffect, useRef, useState } from 'react';
import { moveBlock } from '@app/services/document.service';
import { ReactComponent as Anchor } from '@images/drag-n-drop-icon.svg';
import {
  getBlockUnder,
  getOrSetDraggableDelimiter,
} from '../decorators/withDnD';

interface IDNDWrapper {
  block: ContentBlock;
  getEditorState(): EditorState;
  setEditorState(editorState: EditorState): void;
  children: React.ReactNode;
}

const DNDWrapper = (props: IDNDWrapper) => {
  const refContainer = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [x, setX] = useState(-26);
  const [y, setY] = useState(0);
  const handleMouseDown = (event: any) => {
    if (event.buttons === 1 && refContainer && refContainer.current) {
      event.preventDefault();
      setIsDragging(true);
      setOffsetX(event.clientX - x);
      setOffsetY(event.clientY - y);
    }
  };
  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    if (!isDragging || e.buttons !== 1) return;
    setX(e.clientX - offsetX);
    setY(e.clientY - offsetY);

    const blockBefore = getBlockUnder(
      props.getEditorState().getCurrentContent(),
      {
        clientX: e.clientX,
        clientY: e.clientY,
      },
    );
    const delimiter = getOrSetDraggableDelimiter();
    if (blockBefore) {
      delimiter.style.top =
        blockBefore.position.clientY + blockBefore.position.clientHeight + 'px';
      delimiter.style.left = blockBefore.position.clientX + 'px';
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    setIsDragging(false);
    setX(-26);
    setY(0);
    const blockBefore = getBlockUnder(
      props.getEditorState().getCurrentContent(),
      {
        clientX: e.clientX,
        clientY: e.clientY,
      },
    );
    if (blockBefore) {
      const editorState = props.getEditorState();
      let newEditorState = moveBlock(
        editorState,
        editorState.getSelection(),
        props.block.getKey(),
        blockBefore.key,
      );
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

  return (
    <div
      ref={refContainer}
      className='draggable'
      style={{
        position: isDragging === true ? 'absolute' : 'relative',
        top: y,
        left: x,
      }}
    >
      <Anchor
        className='draggable__anchor'
        onMouseDown={handleMouseDown}
        style={{
          cursor: isDragging === true ? 'grabbing' : 'grab',
        }}
      />
      <div className='draggable__content'>{props.children}</div>
    </div>
  );
};

export default DNDWrapper;
