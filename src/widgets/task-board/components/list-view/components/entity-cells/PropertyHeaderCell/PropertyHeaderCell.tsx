import { HeaderContext } from '@tanstack/react-table';
import HederCellContent from '../../base-cells/HederCellContent';
import { ITask } from '@widgets/task-board/types';
import { useTaskBoard } from '@widgets/task-board/task-board-context';

function PropertyHeaderCell(context: HeaderContext<ITask, unknown>) {
  const { properties } = useTaskBoard();
  const property = properties.find(
    (property) => property.id === context.column.id,
  );

  return (
    <HederCellContent
      $contentAlign='center'
      $uppercase
    >
      {property?.name ?? context.column.id}
    </HederCellContent>
  );
}

export default PropertyHeaderCell;
