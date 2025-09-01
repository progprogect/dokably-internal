import { Table } from '@tanstack/react-table';
import { TableMeta } from '../types';

export const getTableMeta = <TData, M = TableMeta>(table: Table<TData>) => {
  return table.options.meta as M;
};
