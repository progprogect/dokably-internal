import { UnitType } from '@entities/models/unit';
import { ReactComponent as DocumentIcon } from '@images/document.svg';
import { ReactComponent as WhiteboardIcon } from '@images/whiteboard.svg';
import ColoredIcon from '../ui/colored-icon';

export function getUnitTypeIcon<
  U extends { type: UnitType; name: string; color: string | null; emoji?: string | null },
>(unit: U) {
  if (!unit) return <></>;
  switch (unit.type) {
    case 'document':
      return unit?.emoji ? <div className='flex items-center'>{unit.emoji}</div> : <DocumentIcon />;
    case 'channel':
      return (
        <ColoredIcon
          letter={unit.name[0].toUpperCase()}
          color={unit.color}
        />
      );
    case 'whiteboard':
      return <WhiteboardIcon />;
    case 'task_board':
      return <></>;
    default:
      throw new Error(`Unexpected unit type ${unit.type}`);
  }
}
