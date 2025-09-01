import { IProperty, ITask } from "@widgets/task-board/types";
import { AvailablePropertiesProps } from "../../task/TaskInformation";
import { useState } from "react";
import ReactDOM from 'react-dom';
import usePopper from "@app/hooks/usePopper";
import styles from "./styles.module.scss";
import { PropertyTitlePopover } from "./property-title-popover";
import { useTaskBoard } from "@widgets/task-board/task-board-context";
import { useDeleteProperty } from "@app/queries/property/useDeleteProperty";

interface IPropertyTitleProps {
	propertyInfo: AvailablePropertiesProps;
	task: ITask;
	property: IProperty;
	refetchTask: () => void;
	onDelete: (id: string) => void;
};

const portalStyles = {
  zIndex: 4,
  minWidth: 200,
  maxWidth: 520,
  maxHeight: 400,
  padding: '8px',
};

export const PropertyTitle = ({ propertyInfo, task, property, refetchTask, onDelete }: IPropertyTitleProps) => {
	const { id: boardId } = useTaskBoard();
	const { deleteProperty } = useDeleteProperty(boardId);
  const portalId = "popper-portal-kanban-property-title";
  const [searchValue, setSearchValue] = useState<string>(property?.name);
  const [showPopover, setShowPopover] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);

	const onDeleteProperty = async () => {
		await deleteProperty(property.id);
		onDelete(property.id);
		setShowPopover(false);
		refetchTask?.();
	}

  const popover = usePopper({
    portalId,
    referenceElement,
    externalStyles: portalStyles,
    placement: 'bottom-start',
    children: (
			<PropertyTitlePopover
				searchValue={searchValue}
				setSearchValue={setSearchValue}
				onDelete={onDeleteProperty}
			/>
    ),
  });

	return (
		<div className='flex items-start'>
			{showPopover &&
				ReactDOM.createPortal(
					<div
						className={styles.overlay}
						onClick={() => setShowPopover(false)}
					/>,
					document.querySelector("div[role='dialog']")!,
			)}
			<div
				ref={setReferenceElement}
				className='w-50 flex items-center text-[14px] text-[#69696B] h-[32px] p-[3px] gap-2 cursor-pointer rounded-md hover:bg-background'
				onClick={() => setShowPopover(true)}
			>
				{propertyInfo.icon}
				{propertyInfo.title}
			</div>
			<div className='flex flex-1 items-center text-[14px] text-[#69696B] min-h-[32px] h-[auto] max-w-[70%] p-[3px] gap-2 cursor-pointer rounded-md hover:bg-background'>
				{propertyInfo.component(task, property, refetchTask)}
			</div>
			{showPopover && popover}
			<div id={portalId} />
		</div>
	)	
};
