import { useCallback, useEffect, useState, useRef } from 'react';
import { TableState } from '@tanstack/react-table';

import { useTaskBoard } from '@widgets/task-board/task-board-context';

// Table configuration keys for storing different aspects of table state
const getTableConfigKeys = (boardId: string) => ({
  COLUMN_ORDER: `table-${boardId}-columnOrder`,
  COLUMN_SIZING: `table-${boardId}-columnSizing`,
  COLUMN_VISIBILITY: `table-${boardId}-columnVisibility`,
});

// Initial table state that matches the existing structure
const initialTableState: TableState = {
  expanded: {},
  columnVisibility: {},
  columnOrder: [],
  columnPinning: {},
  rowPinning: {},
  columnFilters: [],
  globalFilter: '',
  sorting: [],
  grouping: [],
  columnSizing: {},
  columnSizingInfo: {
    columnSizingStart: [],
    deltaOffset: null,
    deltaPercentage: null,
    isResizingColumn: false,
    startOffset: null,
    startSize: null,
  },
  pagination: {
    pageIndex: 0,
    pageSize: 0,
  },
  rowSelection: {},
};

/**
 * Custom hook for managing table state with server persistence
 * Replaces useLocalStorage with server-side storage using TaskBoard config API
 */
export const useTableStateFromServer = (boardId: string) => {
  const { taskboardConfig, editTaskboardConfig, properties } = useTaskBoard();
  const [tableState, setTableState] = useState<TableState>(initialTableState);
  const [isLoaded, setIsLoaded] = useState(false);

  const configKeys = getTableConfigKeys(boardId);

  // Generate default column order: static columns + property columns
  const getDefaultColumnOrder = useCallback(() => {
    const defaultOrder = [
      'name', // STATIC_COLUMNS.NAME
      ...properties.map(prop => prop.id),
      'actions' // STATIC_COLUMNS.ACTIONS
    ];
    // Generated default column order
    return defaultOrder;
  }, [properties]);

  // Load table state from server configuration
  useEffect(() => {
    if (!taskboardConfig || isLoaded || properties.length === 0) return;

    const columnOrderConfig = taskboardConfig.find((c: any) => c.infoKey === configKeys.COLUMN_ORDER);
    const columnSizingConfig = taskboardConfig.find((c: any) => c.infoKey === configKeys.COLUMN_SIZING);
    const columnVisibilityConfig = taskboardConfig.find((c: any) => c.infoKey === configKeys.COLUMN_VISIBILITY);

    // Use saved column order or generate default one
    const columnOrder = (columnOrderConfig as any)?.data || getDefaultColumnOrder();
    // Load saved table state from server

    // Restore state from server if available, with smart defaults
    setTableState(prev => ({
      ...prev,
      columnOrder,
      columnSizing: (columnSizingConfig as any)?.data || prev.columnSizing,
      columnVisibility: (columnVisibilityConfig as any)?.data || prev.columnVisibility,
    }));

    setIsLoaded(true);
  }, [taskboardConfig, configKeys, isLoaded, properties, getDefaultColumnOrder]);

  // CRITICAL: Listen for taskboardConfig changes to update column order in real-time
  // This ensures new columns are immediately reflected in the table  
  useEffect(() => {
    if (!taskboardConfig || !isLoaded) return; // Only run after initial load

    const columnOrderConfig = taskboardConfig.find((c: any) => c.infoKey === configKeys.COLUMN_ORDER);
    const savedColumnOrder = (columnOrderConfig as any)?.data;

    if (savedColumnOrder) {

      
      setTableState(prev => {
        // Only update if column order actually changed
        const currentOrder = JSON.stringify(prev.columnOrder);
        const newOrder = JSON.stringify(savedColumnOrder);
        
        if (currentOrder !== newOrder) {
          // Prevent race conditions by checking if server state is "going backwards"
          const currentColumns = typeof prev.columnOrder === 'string' ? JSON.parse(prev.columnOrder) : prev.columnOrder;
          const serverColumns = savedColumnOrder;
          
          // Don't update if server has fewer columns (race condition - server returned old state)
          if (serverColumns.length < currentColumns.length) {

            return prev;
          }
          

          return {
            ...prev,
            columnOrder: savedColumnOrder
          };
        }
        

        return prev;
      });
    }
  }, [taskboardConfig, configKeys, isLoaded]);

  // Custom debounced save to server to avoid API spam
  const timeoutRef = useRef<NodeJS.Timeout>();

  const saveTableConfig = useCallback((updatedState: TableState) => {
    if (!isLoaded) return; // Don't save during initial load

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      // Filter out existing table configs for this board
      const filteredConfig = (taskboardConfig || []).filter((c: any) => 
        !Object.values(configKeys).includes(c.infoKey)
      );

      // Add new table configuration
      const newConfigs = [
        ...filteredConfig,
        { infoKey: configKeys.COLUMN_ORDER, data: updatedState.columnOrder },
        { infoKey: configKeys.COLUMN_SIZING, data: updatedState.columnSizing },
        { infoKey: configKeys.COLUMN_VISIBILITY, data: updatedState.columnVisibility },
      ];


      editTaskboardConfig(newConfigs);
    }, 500); // 500ms debounce
  }, [isLoaded, taskboardConfig, configKeys, editTaskboardConfig]);

  // Enhanced setState that also saves to server
  const setTableStateWithPersistence = useCallback((updater: React.SetStateAction<TableState>) => {
    setTableState(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : updater;
      
      // Save to server
      saveTableConfig(newState);
      
      return newState;
    });
  }, [saveTableConfig]);

  // Partial state updater for specific keys (maintains compatibility with existing code)
  const createPartialStateUpdater = useCallback(
    <K extends keyof TableState>(key: K) => {
      return (updater: React.SetStateAction<TableState[K]>) => {
        setTableStateWithPersistence(prev => {
          const currentValue = prev[key];
          const newValue = typeof updater === 'function' 
            ? (updater as (prev: TableState[K]) => TableState[K])(currentValue)
            : updater;
          return { ...prev, [key]: newValue };
        });
      };
    },
    [setTableStateWithPersistence]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    tableState,
    setTableState: setTableStateWithPersistence,
    createPartialStateUpdater,
    isLoaded, // Can be used to show loading state if needed
  };
};