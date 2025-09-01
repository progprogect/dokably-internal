import { Column } from '@tanstack/react-table';
import { DefaultColumnMeta } from '../types';

export const getColumnMeta = <TData, M = DefaultColumnMeta>(
  column: Column<TData>,
) => {
  return column.columnDef.meta as M;
};
