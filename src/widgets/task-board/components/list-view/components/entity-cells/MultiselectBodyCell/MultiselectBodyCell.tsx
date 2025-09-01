import { CellContext } from '@tanstack/react-table';
import { ITask } from '@widgets/task-board/types';
import BodyCellContent from '../../base-cells/BodyCellContent';
import { getColumnMeta } from '../../../utils/getColumnMeta';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import { Option } from '@widgets/editor/plugins/blocks/Table/Table.types';
import { useMemo, useState } from 'react';
import style from "./styles.module.scss";
import { SelectMenu } from '@widgets/editor/plugins/blocks/Table/cells/SelectCell/SelectMenu';

function MultiselectBodyCell(context: CellContext<ITask, ITask>) {
  // const isVirtual = isVirtualTask(context.cell.row.original);
  const properties = context.getValue()?.properties;
  const columnMeta = getColumnMeta(context.column);
  const columnId = context.column.id;
  const { updateTaskMultiselect, updateTaskMultiselectOptions, multiselectOptions } = useTaskBoard();

  const options = useMemo(() => multiselectOptions.map(option => ({
    id: option.id,
    label: option.name,
    color: option.params.color
  })), [multiselectOptions]);

  const values = useMemo(() => properties?.find(property => property.id === columnId)?.value
    .map((item: string) => ({
      id: item,
      label: options.find(option => option.id === item)?.label,
      color: options.find(option => option.id === item)?.color,
    })
  ), [properties, options, columnId]);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const activeOptions = options.filter((option) => values?.map((value: Option) => value.id).includes(option.id));

  const updateValue = (values: Option[]) => {
    updateTaskMultiselect(context.row.original.id, columnId, values?.map((option) => option.id) || []);
  };

  const updateOptions = (options: Option[]) => {
    updateTaskMultiselectOptions(columnId, options);
  };

  const handlePopoverOpenChange = () => setIsPopoverOpen(!isPopoverOpen);
  
  return (
    <BodyCellContent className={columnMeta.className} style={{ padding: 0 }}>
      <Popover
        open={isPopoverOpen}
        onOpenChange={handlePopoverOpenChange}
      >
        <PopoverTrigger
          className={style.multiselectWrapper}
          style={{ borderColor: isPopoverOpen ? "#4a86ff" : "" }}
        >
          <div className={style.multiselectCell}>
            {activeOptions && activeOptions.map((value) => (
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
          // className={style.popover}
          portal
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
    </BodyCellContent>
  );
}

export default MultiselectBodyCell;

