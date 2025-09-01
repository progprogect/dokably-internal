import { HeaderContext } from '@tanstack/table-core';
import React from 'react';

import styles from './styles.module.scss';

function WithResizeHandlerHeaderCell<TData, TValue>(
  ColumnComponent: React.ComponentType<HeaderContext<TData, TValue>>,
) {
  return function InteractiveHeaderCell(context: HeaderContext<TData, TValue>) {
    return (
      <>
        <ColumnComponent {...context} />
        <button
          onMouseDown={e => {
            e.stopPropagation();
            context.header.getResizeHandler()(e)
          }}
          onTouchStart={context.header.getResizeHandler()}
          className={styles['resize-handler']}
          aria-label='Resize handler'
          onPointerDown={(e) => e.stopPropagation()}
        />
      </>
    );
  };
}
export default WithResizeHandlerHeaderCell;
