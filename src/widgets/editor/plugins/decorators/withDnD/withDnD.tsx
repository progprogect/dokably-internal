import { getBlockUnder, getOrSetDraggableDelimiter } from './utils';
import { moveBlock } from '@app/services/document.service';
import { CSSProperties, ReactElement, useEffect, useRef, useState } from 'react';
import { ReactComponent as Anchor } from '@images/drag-n-drop-icon.svg';
import './style.css';
import { PluginBlockPropsToRender, PluginBlockToRender, PluginProps } from '../../types';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';

export const withDnD =
  (options?: { containerStyle?: CSSProperties; contentStyle?: CSSProperties }) =>
  <P extends PluginBlockPropsToRender>(WrappedComponent: PluginBlockToRender<P>) => {
    return (props: PluginProps<P>): ReactElement => {
      const { readonly } = useDokablyEditor();
      const store = props.blockProps.store;
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

        const blockBefore = getBlockUnder(props.contentState, {
          clientX: e.clientX,
          clientY: e.clientY,
        });
        const delimiter = getOrSetDraggableDelimiter();
        if (blockBefore) {
          delimiter.style.top = blockBefore.position.clientY + blockBefore.position.clientHeight + 'px';
          delimiter.style.left = blockBefore.position.clientX + 'px';
        }
      };

      const handleMouseUp = (e: MouseEvent) => {
        setIsDragging(false);
        setX(-26);
        setY(0);
        const blockBefore = getBlockUnder(props.contentState, {
          clientX: e.clientX,
          clientY: e.clientY,
        });
        if (blockBefore) {
          const editorState = store.getItem('getEditorState')!();
          const newEditorState = moveBlock(
            editorState,
            editorState.getSelection(),
            props.block.getKey(),
            blockBefore.key,
          );
          store.getItem('setEditorState')!(newEditorState);
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

      const draggingStyles = isDragging ? { zIndex: 3, opacity: 0.8 } : {};

      return (
        <div
          ref={refContainer}
          className='draggable'
          style={{
            position: 'relative',
            top: y,
            left: x,
            ...draggingStyles,
            ...options?.containerStyle,
          }}
        >
          {!readonly && (
            <Anchor
              className='draggable__anchor'
              onMouseDown={handleMouseDown}
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
            />
          )}

          <div
            style={options?.contentStyle}
            className='draggable__content'
          >
            <WrappedComponent {...props} />
          </div>
        </div>
      );
    };
  };
