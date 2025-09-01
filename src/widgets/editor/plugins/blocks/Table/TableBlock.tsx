import { useCallback, useEffect, useMemo, useRef } from 'react';
import { EditorState, Modifier, SelectionState } from 'draft-js';
import * as Immutable from 'immutable';

import Table from './Table';
import TableDNDWrapper from './TableDndWrapper';
import { useTableReducer } from './Table.state';
import { ViewportPortal } from './ViewportPortal';
import { TableContext } from './TableContext';

import './style.css';
import './tableStyles.css';
import { State } from '@widgets/editor/plugins/blocks/Table/Table.types';
const TableBlock = (props: any) => {
  const scrollToColumnRef = useRef<(columnId?: string) => void>();

  const scrollToColumn = useCallback((columnId?: string) => {
    if (scrollToColumnRef.current) {
      scrollToColumnRef.current(columnId);
    }
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);

  const { block } = props;
  const { store } = props.blockProps;
  const editorStateBlock = block.get('data').get('state') || {};

  const initialState: State = {
    columns: editorStateBlock.columns,
    data: editorStateBlock.data,
    sorting: editorStateBlock.sorting || [],
    lastAddedColumnId: editorStateBlock.lastAddedColumnId || null,
  };
  const [state, dataDispatch] = useTableReducer(initialState);

  const blockKey = useMemo(() => block.get('key'), [block]);
  const portalId = useMemo(() => `portal-${blockKey}`, [blockKey]);
  const blockState = useMemo(() => state, [state]);
  const memoStore = useMemo(() => store, [store]);

  useEffect(() => {
    const updateTableState = (
      editorState: EditorState,
      blockKey: string,
      blockState: Record<string, any>,
    ): EditorState => {
      const selection = SelectionState.createEmpty(blockKey);
      const newData = Immutable.Map().set('state', blockState);
      const newContent = Modifier.setBlockData(editorState.getCurrentContent(), selection, newData);
      const newEditorState = EditorState.push(editorState, newContent, 'change-block-data');

      return newEditorState;
    };

    const setEditorState = memoStore.getItem('setEditorState');
    if (typeof setEditorState === 'function') {
      setEditorState((prevState: EditorState) => {
        const newState = updateTableState(prevState, blockKey, blockState);

        return newState;
      });
    }
  }, [blockState, memoStore, blockKey]);

  const focusTable = useCallback(() => {
    const editorState = store.getItem('getEditorState')();
    const selection = editorState.getSelection();
    const blockKey = block.get('key');

    if (selection.getFocusKey() !== blockKey) {
      const newSelection = selection.merge({
        anchorKey: blockKey,
        anchorOffset: 0,
        focusKey: blockKey,
        focusOffset: 0,
        hasFocus: false,
      });
      const newEditorState = EditorState.forceSelection(editorState, newSelection);
      store.getItem('setEditorState')(newEditorState);
    }
  }, [block, store]);

  return (
    <TableContext.Provider value={{ state, portalId, focusTable, dataDispatch, scrollToColumn, scrollToColumnRef }}>
      <TableDNDWrapper
        block={block}
        store={store}
        setEditorState={store.getItem('setEditorState')}
        getEditorState={() => store.getItem('getEditorState')()}
        dndRef={containerRef}
      >
        <div
          contentEditable={false}
          data-block-type='table'
        >
          <div id={portalId} />
          <div id={`${portalId}-option`} />
          <Table />
        </div>
      </TableDNDWrapper>
    </TableContext.Provider>
  );
};

export default TableBlock;
