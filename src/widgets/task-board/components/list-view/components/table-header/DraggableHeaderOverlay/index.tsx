import { flexRender, Header, HeaderGroup, Row, Table } from "@tanstack/react-table";
import HeaderCell from "../../base-cells/HeaderCell";
import { ITask } from "@widgets/task-board/types";
import { cn } from "@app/utils/cn";
import styles from "./styles.module.scss";

interface IDraggableHeaderOverlayProps {
	table: Table<ITask>;
	activeColumnId: string;
	containerRef: React.RefObject<HTMLDivElement>;
}

export const DraggableHeaderOverlay = ({ table, activeColumnId, containerRef }: IDraggableHeaderOverlayProps) => {
  const rowHeights: number[] = [];
  if (containerRef?.current) {
    const sourceRows = containerRef.current.querySelectorAll('div[role="row"]');
    sourceRows.forEach((row: Element) => {
      rowHeights.push(row.getBoundingClientRect().height);
    });
  }
	
	return (
		<HeaderCell
			style={{width: table.getColumn(activeColumnId)?.getSize() }}
			className={cn(styles['header-cell'], styles['header-cell_active'])}
		>
			{flexRender(
				table.getColumn(activeColumnId)?.columnDef.header,
				(table as any).getHeaderGroups()
					?.flatMap((group: HeaderGroup<ITask>) => group.headers)
					?.find((header: Header<ITask, unknown>) => header.column.id === activeColumnId)
					?.getContext()
			)}
			<div>
				{table.getRowModel().rows.map((row: Row<ITask>, index: number) => {
					const cell = row.getAllCells().find((c) => c.column.id === activeColumnId);
					if (!cell) return null;
					return (
						<div 
							key={`${row.id}-${activeColumnId}-${index}`}
							style={{
								marginTop: !index ? 0 : 6,
								height: `${rowHeights[index+1]}px`
							}}
						>
							{flexRender(cell.column.columnDef.cell, cell.getContext())}
						</div>
					);
				})}
			</div>
		</HeaderCell>
	)
};