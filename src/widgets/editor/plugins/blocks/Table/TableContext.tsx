import React, { createContext, useContext } from 'react';
import { State, Action } from './Table.types';

interface TableContextProps {
  state: State;
  dataDispatch: React.Dispatch<Action>;
  portalId: string;
  focusTable: () => void;
  scrollToColumn?: (columnId?: string) => void;
  scrollToColumnRef?: React.MutableRefObject<((columnId?: string) => void) | undefined>;
}

export const TableContext = createContext<TableContextProps | null>(null);

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
};
