import { IProperty, ITask } from "@widgets/task-board/types";
import { FC, useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import { Option } from '@widgets/editor/plugins/blocks/Table/Table.types';
import { SelectMenu } from "@widgets/editor/plugins/blocks/Table/cells/SelectCell/SelectMenu";
import { useTaskBoard } from "@widgets/task-board/task-board-context";
import style from "@widgets/task-board/components/list-view/components/entity-cells/MultiselectBodyCell/styles.module.scss";


export interface TaskMultiselectPropertyProps {
  task: ITask;
  property: IProperty;
  size?: 'sm' | 'lg';
  refetch?: () => void;
}

export const TaskMultiselectProperty: FC<TaskMultiselectPropertyProps> = ({
  task,
  property,
  refetch,
}) => {
  const { updateTaskMultiselect, updateTaskMultiselectOptions, multiselectOptions } = useTaskBoard();

  const options = useMemo(() => multiselectOptions?.map(option => ({
    id: option.id,
    label: option.name,
    color: option.params.color
  })), [multiselectOptions]);

  const values = useMemo(() => task.properties?.find(p => p.id === property.id)?.value
    ?.map((item: string) => ({
      id: item,
      label: options.find(option => option.id === item)?.label,
      color: options.find(option => option.id === item)?.color,
    })
  ), [task.properties, options, property.id]);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const activeOptions = options.filter((option) => values?.map((value: Option) => value.id).includes(option.id));

  const updateValue = async (values: Option[]) => {
    await updateTaskMultiselect(task.id, property.id, values?.map((option) => option.id) || []);
		refetch?.();
  };

  const updateOptions = (options: Option[]) => {
    updateTaskMultiselectOptions(property.id, options);
  };

  const handlePopoverOpenChange = () => setIsPopoverOpen(!isPopoverOpen);

	return (
		<Popover
			open={isPopoverOpen}
			onOpenChange={handlePopoverOpenChange}
		>
			<PopoverTrigger
				style={{
					borderColor: isPopoverOpen ? "#4a86ff" : "",
					height: 26,
					width: "100%"
				}}
			>
				<div className={style.multiselectCell} style={{ width: "100%", height: "100%" }}>
					{activeOptions && activeOptions.map((value: any) => (
						<span
							key={value.id}
							className={style.status}
							style={{
								backgroundColor: value.color,
								color: value.color === '#FFFFFF' ? '#A9A9AB' : '#FFFFFF',
								borderColor:
									value.color === '#FFFFFF' ? '#A9A9AB' : value.color,
							}}
						>
							<span>{value.label}</span>
						</span>
					))}
				</div>
			</PopoverTrigger>

			<PopoverContent
				className={style.popover}
				autoFocusContent={false}
				side='bottom'
				align='start'
			>
				<SelectMenu
					value={activeOptions}
					updateValue={updateValue}
					options={options}
					updateOptions={updateOptions}
				/>
			</PopoverContent>
		</Popover>
	)
};