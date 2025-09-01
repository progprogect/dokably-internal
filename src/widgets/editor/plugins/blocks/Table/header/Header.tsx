import { useEffect, useState, useRef } from 'react';
import cn from 'classnames';

import { Header as ReactTableHeader } from '@tanstack/react-table';
import DataTypeIcon from './DataTypeIcon';
import { HeaderMenu } from './HeaderMenu';
import usePopper from '@app/hooks/usePopper';
import ReactDOM from 'react-dom';
import cssStyles from './style.module.scss';
import { TableRow } from '@widgets/editor/plugins/blocks/Table/Table.types';
import { ActionTypes } from '@widgets/editor/plugins/blocks/Table/utils';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

interface Props {
  header: ReactTableHeader<TableRow, any>;
}

const portalStyles = {
  zIndex: 4,
  minWidth: 200,
  maxWidth: 520,
  maxHeight: 400,
  padding: '8px',
};

export default function Header({ header }: Props) {
  const { id, column, getResizeHandler } = header;
  const { columnDef, getIsResizing } = column;
  const { label, dataType } = columnDef as any;
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const wasResizingRef = useRef(false);
  const resizerRef = useRef<HTMLDivElement>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  const { dataDispatch, portalId } = useTableContext();

  useEffect(() => {
    const isCurrentlyResizing = getIsResizing();
    if (wasResizingRef.current && !isCurrentlyResizing) {
      dataDispatch({
        type: ActionTypes.UPDATE_COLUMN_SIZE,
        columnId: id,
        size: column.getSize(),
      });
    }
    wasResizingRef.current = isCurrentlyResizing;
  }, [getIsResizing(), column, dataDispatch, id]);

  const popover = usePopper({
    portalId,
    referenceElement,
    externalStyles: portalStyles,
    placement: 'bottom-start',
    children: (
      <HeaderMenu
        label={label}
        dataType={dataType}
        columnId={id}
        setShowHeaderMenu={setShowHeaderMenu}
      />
    ),
  });

  const findScrollContainer = (element: HTMLElement): HTMLElement | null => {
    let parent = element.parentElement;

    while (parent) {
      const style = window.getComputedStyle(parent);
      const hasScroll =
        style.overflowX === 'auto' ||
        style.overflowX === 'scroll' ||
        style.overflow === 'auto' ||
        style.overflow === 'scroll';
      if (hasScroll) return parent;
      parent = parent.parentElement;
    }
    return null;
  };

  const handleResize = (e: React.MouseEvent | React.TouchEvent) => {
    const originalHandler = getResizeHandler();
    originalHandler(e);

    if (resizerRef.current) {
      scrollContainerRef.current = findScrollContainer(resizerRef.current);
    }

    const handleMouseMove = () => {
      const EDGE_PADDING = 20;

      if (resizerRef.current) {
        if (scrollAnimationRef.current) {
          cancelAnimationFrame(scrollAnimationRef.current);
        }

        scrollAnimationRef.current = requestAnimationFrame(() => {
          const resizerRect = resizerRef.current!.getBoundingClientRect();
          const scrollContainer = scrollContainerRef.current;

          if (scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();

            if (resizerRect.right > containerRect.right - EDGE_PADDING) {
              const scrollOffset = Math.ceil(resizerRect.right - (containerRect.right - EDGE_PADDING));
              scrollContainer.scrollLeft += scrollOffset;
            }
          }
        });
      }
    };

    const cleanUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', cleanUp, { once: true });
  };

  return (
    <>
      {showHeaderMenu &&
        ReactDOM.createPortal(
          <div
            className={cssStyles.overlay}
            onClick={() => setShowHeaderMenu(false)}
          />,
          document.body,
        )}

      <div className='th d-inline-block text-text50 font-medium cursor-pointer text-[14px]'>
        <div
          className='th-content'
          onClick={() => {
            setShowHeaderMenu(true);
          }}
          ref={setReferenceElement}
          contentEditable={false}
        >
          <span className='svg-icon svg-gray icon-margin'>
            <DataTypeIcon dataType={dataType} />
          </span>
          {label}
        </div>
        <div
          ref={resizerRef}
          className={cn(`resizer resizer-${id}`, { ['resizer-resizing']: getIsResizing() })}
          onMouseDown={handleResize}
          onTouchStart={handleResize}
        />
      </div>

      {showHeaderMenu && popover}
    </>
  );
}
