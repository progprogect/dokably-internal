import { DataNumberTypes, DataTypes } from '../utils';
import { AssigneeCell } from './AssigneeCell';
import { CheckboxCell } from './CheckboxCell';
import { DocLinkCell } from './DocLinkCell';
import { DueDateCell } from './DueDateCell';
import { EmailCell } from './EmailCell';
import { FilesCell } from './FilesCell';
import NumberCell from './NumberCell/NumberCell';
import { PriorityCell } from './PriorityCell';
import { SelectCell } from './SelectCell';
import { StatusCell } from './StatusCell';
import { TextCell } from './TextCell';
import { UrlCell } from './UrlCell';
import { Column } from '@tanstack/react-table';
import { Option, TableRow } from '@widgets/editor/plugins/blocks/Table/Table.types';

export interface CellProps {
  value: any;
  column: Column<TableRow>;
  row: { index: number };
}

export default function Cell({ value, row: { index: rowIndex }, column: { columnDef } }: CellProps) {
  const {
    id: columnId,
    dataType,
    options,
  } = columnDef as { id: string; dataType: DataTypes | DataNumberTypes; options: Option[] };

  function getCellElement() {
    switch (dataType) {
      case DataTypes.ASSIGNEE:
        return (
          <AssigneeCell
            value={value}
            rowIndex={rowIndex}
            columnId={columnId}
          />
        );
      case DataTypes.PRIORITY:
        return (
          <PriorityCell
            value={value}
            options={options}
            rowIndex={rowIndex}
            columnId={columnId}
          />
        );
      case DataTypes.STATUS:
        return (
          <StatusCell
            value={value}
            options={options}
            rowIndex={rowIndex}
            columnId={columnId}
          />
        );
      case DataTypes.EMAIL:
        return (
          <EmailCell
            value={value}
            rowIndex={rowIndex}
            columnId={columnId}
          />
        );
      case DataTypes.CHECKBOX:
        return (
          <CheckboxCell
            value={value}
            rowIndex={rowIndex}
            columnId={columnId}
          />
        );
      case DataTypes.SELECT:
        return (
          <SelectCell
            value={value}
            options={options}
            rowIndex={rowIndex}
            columnId={columnId}
          />
        );
      case DataTypes.TEXT:
        return (
          <TextCell
            value={value}
            rowIndex={rowIndex}
            columnId={columnId}
          />
        );
      case DataTypes.NUMBER:
      // case DataNumberTypes.NUMBER_WITH_COMMAS:
      case DataNumberTypes.PERCENT:
      case DataNumberTypes.EURO:
      case DataNumberTypes.US_DOLLAR:
      case DataNumberTypes.POUND:
        return (
          <NumberCell
            dataType={dataType}
            value={value}
            rowIndex={rowIndex}
            columnId={columnId}
          />
        );
      case DataTypes.DUE_DATE:
        return (
          <DueDateCell
            value={value}
            rowIndex={rowIndex}
            columnId={columnId}
          />
        );

      case DataTypes.URL:
        return (
          <UrlCell
            value={value}
            rowIndex={rowIndex}
            columnId={columnId}
          />
        );

      case DataTypes.FILES_AND_MEDIA:
        return (
          <FilesCell
            value={value}
            rowIndex={rowIndex}
            columnId={columnId}
          />
        );
      case DataTypes.DOC_LINKS:
        return (
          <DocLinkCell
            value={value}
            rowIndex={rowIndex}
            columnId={columnId}
          />
        );

      default:
        return (
          <span
            className='coming-soon'
            style={{ margin: '8px' }}
          >
            Coming soon
          </span>
        );
    }
  }

  return getCellElement();
}
